import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import { ref, reactive } from "vue";

export const useTasksUsersStore = defineStore("TasksUsersStore", {
  state: () => ({
    errors: {},
    task_id: ref(null),
    users: ref([]),
    myserver: "http://localhost:8000/api",
  }),

  actions: {
    async getTaskOtherPotentialTeamMembers(task_id, task_manager_user_id) {
      const authStore = useAuthStore();
      if (authStore.user.id === task_manager_user_id) {
        try {
          const res = await fetch(`${this.myserver}/tasksUsers/potential-members/task/${task_id}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
            },
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok) {
            this.errors = { task: [data.message || "Team fetching error"] };
            return {};
          } else if (data !== null && !(Array.isArray(data) && data.length === 0)) {
            if (data.errors) {
              this.errors = data.errors;
              return {};
            } else if (data.message) {
              this.errors = { task: [data.message] };
              return {};
            } else {
              this.errors = {};
              return data;
            }
          } else {
            this.errors = { task: ["No other users fetched!"] };
            return {};
          }
        } catch (error) {
          this.errors = { task: ["Network error or server is unreachable. " + error.message] };
          return {};
        }
      } else {
        this.errors = { task: ["Not authorized to view the team of this task!"] };
        return {};
      }
    },

    async addTaskTeamMember(user_id, task_id, task_manager_user_id) {
      const formData = reactive({ user_id, task_id });
      const authStore = useAuthStore();
      if (authStore.user.id === task_manager_user_id) {
        try {
          const res = await fetch(`${this.myserver}/tasksUsers`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
            },
            body: JSON.stringify(formData),
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok) {
            this.errors = { task: [data.message] };
            if (res.status === 422) {
              this.errors = data.errors || { task: ["Error at adding task member"] };
            } else {
              this.errors = { task: ["Team member creation error: " + (data?.message || "")] };
            }
            return false;
          } else if (data !== null && !(Array.isArray(data) && data.length === 0)) {
            if (data.errors) {
              this.errors = data.errors;
              return false;
            } else if (data.message) {
              this.errors = { task: [data.message] };
              return false;
            } else {
              this.errors = {};
              return true;
            }
          } else {
            this.errors = { task: ["No team member fetched after adding with errors!"] };
            return false;
          }
        } catch (error) {
          this.errors = { task: ["Network error or server is unreachable. " + error.message] };
          return false;
        }
      } else {
        this.errors = { task: ["Not authorized to add team members to this task!"] };
        return false;
      }
    },

    async deleteTeamMember(task, user) {
      const authStore = useAuthStore();
      if (authStore.user.user_role.role === "admin" || authStore.user.id === task.manager_user_id) {
        try {
          const res = await fetch(`${this.myserver}/tasksUsers/delete/task/${task.id}/user/${user.id}`, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
            },
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok) {
            this.errors = { task: [data.message || "Team member deletion error"] };
          } else if (data !== null && !(Array.isArray(data) && data.length === 0)) {
            if (data.errors) {
              this.errors = data.errors;
            } else {
              this.errors = {};
              console.log("Successfully deleted team user!");
            }
          } else {
            this.errors = { task: ["No data fetched!"] };
          }
        } catch (error) {
          this.errors = { task: ["Network error or server is unreachable. " + error.message] };
        }
      } else {
        this.errors = { task: ["Not authorized to delete team members of this task!"] };
      }
    },
  },
});
