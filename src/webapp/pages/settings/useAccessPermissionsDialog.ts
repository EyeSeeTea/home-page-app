import { Permission } from "../../../domain/entities/Permission";
import { SharedUpdate } from "../../components/permissions-dialog/PermissionsDialog";
import { useMemo } from "react";

type BuildPermissionProps = {
    permissions?: Permission;
    updatePermissions: (props: SharedUpdate) => Promise<void>;
    name: string;
};

export function useAccessPermissionsDialog(props: BuildPermissionProps) {
    const { permissions, updatePermissions, name } = props;

    return useMemo(
        () => ({
            object: {
                name: name,
                publicAccess: "--------",
                userAccesses:
                    permissions?.users?.map(ref => ({
                        ...ref,
                        access: "rw----",
                    })) ?? [],
                userGroupAccesses:
                    permissions?.userGroups?.map(ref => ({
                        ...ref,
                        access: "rw----",
                    })) ?? [],
            },
            onChange: updatePermissions,
        }),
        [permissions, updatePermissions, name]
    );
}
