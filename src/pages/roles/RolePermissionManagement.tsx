import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { api, getErrorMessage } from "../../lib/api";
import { ApiResponse, PermissionGroup, PermissionKey, Role } from "../../types";

type PermissionResponse = {
  permissions: PermissionKey[];
  groups: PermissionGroup[];
};

export const RolePermissionManagement = () => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<
    PermissionKey[]
  >([]);
  const [message, setMessage] = useState("");

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Role[]>>("/roles");
      return res.data.data;
    },
  });

  const permissionsQuery = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res =
        await api.get<ApiResponse<PermissionResponse>>("/roles/permissions");
      return res.data.data;
    },
  });

  const selectedRole = rolesQuery.data?.find(
    (role) => role._id === selectedRoleId,
  );

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRoleId) throw new Error("Select a role first");
      const res = await api.patch<ApiResponse<Role>>(
        `/roles/${selectedRoleId}/permissions`,
        {
          permissions: selectedPermissions,
        },
      );
      return res.data.data;
    },
    onSuccess: async () => {
      setMessage(
        "Permissions updated successfully. Users may need to login again to refresh sidebar access.",
      );
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  const handleSelectRole = (roleId: string) => {
    setMessage("");
    setSelectedRoleId(roleId);
    const role = rolesQuery.data?.find((item) => item._id === roleId);
    setSelectedPermissions(role?.permissions || []);
  };

  const togglePermission = (permission: PermissionKey) => {
    setMessage("");
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  };

  const toggleModule = (permissions: PermissionKey[]) => {
    const allSelected = permissions.every((permission) =>
      selectedPermissions.includes(permission),
    );
    setSelectedPermissions((current) => {
      if (allSelected)
        return current.filter((item) => !permissions.includes(item));
      return [...new Set([...current, ...permissions])];
    });
  };

  if (rolesQuery.isLoading || permissionsQuery.isLoading) {
    return <div className="card">Loading roles and permissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-900 p-3 text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Role & Permission Management
          </h1>
          <p className="text-sm text-slate-500">
            Admin can update database-driven permissions for each role.
          </p>
        </div>
      </div>

      {message && (
        <div className="card border border-slate-200 text-sm text-slate-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="card h-fit">
          <h2 className="mb-4 font-semibold text-slate-900">Roles</h2>
          <div className="space-y-2">
            {rolesQuery.data?.map((role) => (
              <button
                key={role._id}
                onClick={() => handleSelectRole(role._id)}
                className={`w-full rounded-lg border px-4 py-3 text-left ${
                  selectedRoleId === role._id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="font-semibold">{role.name}</div>
                <div
                  className={`text-xs ${selectedRoleId === role._id ? "text-slate-200" : "text-slate-500"}`}
                >
                  {role.permissions.length} permissions
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          {!selectedRole ? (
            <div className="text-sm text-slate-500">
              Select a role to manage permissions.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedRole.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedRole.description || "No description"}
                  </p>
                </div>
                <button
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Permissions"}
                </button>
              </div>

              <div className="space-y-5">
                {permissionsQuery.data?.groups.map((group) => {
                  const modulePermissions = group.permissions.map(
                    (permission) => permission.key,
                  );
                  const allModuleSelected = modulePermissions.every(
                    (permission) => selectedPermissions.includes(permission),
                  );

                  return (
                    <div
                      key={group.module}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">
                          {group.module}
                        </h3>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={allModuleSelected}
                            onChange={() => toggleModule(modulePermissions)}
                            className="h-4 w-4"
                          />
                          Select module
                        </label>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {group.permissions.map((permission) => (
                          <label
                            key={permission.key}
                            className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-3"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(
                                permission.key,
                              )}
                              onChange={() => togglePermission(permission.key)}
                              className="mt-1 h-4 w-4"
                            />
                            <span>
                              <span className="block text-sm font-medium text-slate-800">
                                {permission.label}
                              </span>
                              <span className="block text-xs text-slate-500">
                                {permission.key}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
