"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, Shield, UserRound } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import api from "@/lib/api";
import { canManageMembers } from "@/lib/permissions";
import Navbar from "@/components/Navbar";

type Member = {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  role: string;
  is_organization_owner: boolean;
};

const roles = ["owner", "admin", "manager", "developer", "viewer"];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const canManageTeam = canManageMembers(userRole);
  const [isRealOwner, setIsRealOwner] = useState(false);

  const getAvailableRoles = () => {
    if (userRole === "owner" && currentUserId) {
      return roles;
    }

    return roles.filter((role) => role !== "owner");
  };

  // const fetchCurrentUser = async () => {
  //   try {
  //     const response = await api.get("/auth/me");

  //     setCurrentUserId(response.data.id);
  //     setUserRole(response.data.role);
  //   } catch (error) {
  //     console.error("Failed to fetch current user:", error);
  //     toast.error("Failed to load user information.");
  //   }
  // };

  // const fetchMembers = async () => {
  //   try {
  //     setLoading(true);

  //     const response = await api.get("/organizations/members");

  //     setMembers(response.data);
  //   } catch (error: any) {
  //     console.error("Failed to fetch members:", error);

  //     toast.error(
  //       error?.response?.data?.detail || "Failed to load team members.",
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  


  // useEffect(() => {
  //   fetchCurrentUser();
  //   fetchMembers();
  // }, []);



useEffect(() => {
  const loadTeamPage = async () => {
    try {
      const userResponse = await api.get("/auth/me");

      const currentId = userResponse.data.id;
      setCurrentUserId(currentId);
      setUserRole(userResponse.data.role);

      const membersResponse = await api.get(
        "/organizations/members"
      );

      const membersData: Member[] =
        membersResponse.data;

      setMembers(membersData);

      const currentMember = membersData.find(
        (member) => member.id === currentId
      );

      if (currentMember) {
        setIsRealOwner(
          currentMember.is_organization_owner
        );
      }
    } catch (error: unknown) {
      console.error(
        "Failed to load team page:",
        error
      );

      toast.error(
        getApiErrorMessage(error, "Failed to load team.")
      );
    } finally {
      setLoading(false);
    }
  };

  loadTeamPage();
}, []);


const canChangeMemberRole = (member: Member) => {
  // Managers, developers and viewers cannot manage roles
  if (!canManageTeam) {
    return false;
  }

  // Nobody changes their own role
  if (member.id === currentUserId) {
    return false;
  }

  // Real owner can manage everyone
  if (isRealOwner) {
    return true;
  }

  // Non-real-owner Owner/Admin cannot change real owner's role
  if (member.is_organization_owner) {
    return false;
  }

  return true;
};


// const getAvailableRoles = () => {
//   if (isRealOwner) {
//     return [
//       "owner",
//       "admin",
//       "manager",
//       "developer",
//       "viewer",
//     ];
//   }

//   return [
//     "admin",
//     "manager",
//     "developer",
//     "viewer",
//   ];
// };


  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await api.patch(
        `/organizations/members/${memberId}/role`,
        {
          role: newRole,
        },
      );

      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          member.id === memberId ? response.data : member,
        ),
      );

      toast.success("Member role updated.");
    } catch (error: unknown) {
      console.error("Failed to update role:", error);

      toast.error(
        getApiErrorMessage(error, "Failed to update member role."),
      );
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/organizations/members/${memberId}`);

      setMembers((currentMembers) =>
        currentMembers.filter((member) => member.id !== memberId),
      );

      toast.success("Member removed successfully.");
    } catch (error: unknown) {
      console.error("Failed to remove member:", error);

      toast.error(getApiErrorMessage(error, "Failed to remove member."));
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div>
      <Navbar/>
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>

            <p className="text-sm text-gray-500">
              Manage your organization members and roles.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading team members...
            </div>
          ) : members.length === 0 ? (
            <div className="p-10 text-center">
              <UserRound className="mx-auto mb-3 h-10 w-10 text-gray-400" />

              <p className="text-gray-500">No team members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Member
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>

                    {canManageTeam && (
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <UserRound className="h-5 w-5 text-blue-600" />
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {member.name}
                            </p>

                            <p className="text-xs text-gray-500">{member.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.email}
                      </td>


                      <td className="px-6 py-4">
  {canChangeMemberRole(member) ? (
    <select
      value={member.role}
      onChange={(e) =>
        handleRoleChange(
          member.id,
          e.target.value
        )
      }
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
    >
      {getAvailableRoles().map((role) => (
        <option
          key={role}
          value={role}
        >
          {formatRole(role)}
        </option>
      ))}
    </select>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
      <Shield className="h-4 w-4" />
      {formatRole(member.role)}
    </span>
  )}
</td>

                      {/* <td className="px-6 py-4">
                        {canManageMembers && member.id !== currentUserId ? (
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(member.id, e.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                          >
                            {availableRoles.map((role) => (
                              <option key={role} value={role}>
                                {formatRole(role)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                            <Shield className="h-4 w-4" />
                            {formatRole(member.role)}
                          </span>
                        )}
                      </td> */}

                      {canManageTeam && (
                        <td className="px-6 py-4 text-right">
                          {member.id !== currentUserId && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
    </div>
  );
}
