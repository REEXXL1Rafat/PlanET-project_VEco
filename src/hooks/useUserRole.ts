import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { rolesApi, AppRole } from "@/api/roles";

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const userRoles = await rolesApi.getUserRoles(user.id);
        setRoles(userRoles);
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const isModerator = hasRole('moderator');
  const canModerate = isAdmin || isModerator;

  return { roles, hasRole, isAdmin, isModerator, canModerate, loading };
};
