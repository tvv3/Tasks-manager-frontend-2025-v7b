import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import { ref } from "vue";

export const useTasksStore = defineStore("TasksStore", {
  state: () => ({
    errors: {},
    tasks: ref([]),
    mytasks: ref([]),
    myserver: "http://localhost:8000/api",
  }),

  getters: {
    getTaskById: (state) => (id) => {
      return state.mytasks.find((task) => task.id === id);
    },
  },

  actions: {
    /************************* getTask **************************/
    async getTask(task_id) {
      try {
        const res = await fetch(`${this.myserver}/tasks/${task_id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
             "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
          },
          credentials: "include", // send cookies automatically
        });

        const data = await res.json();

        if (data.errors) {
          this.errors = data.errors;
          console.log("errors at getting the task ", data.errors);
          return {};
        } else {
          if (data.data) {
            console.log({ task123: data.data[0] });
            return data.data[0];
          } else {
            console.log("task not found!");
            return {};
          }
        }
      } catch (err) {
        console.log(err.message);
        return {};
      }
    },

    /************************* editTask ************************/  
    async editTask(task_id, task_manager_user_id, formData) {
      const authStore = useAuthStore();
      if (authStore.user.id === task_manager_user_id) {
        try {
          const res = await fetch(`${this.myserver}/tasks/${task_id}`, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
               "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
            },
            body: JSON.stringify(formData),
            credentials: "include",
          });

          const data = await res.json();

          if (data.errors) {
            this.errors = data.errors;
            console.log(data.errors);
          } else {
            this.router.push({ name: "tasks" });
          }
        } catch (err) {
          console.log(err.message);
        }
      } else {
        console.log("Not authorized to edit this task!");
      }
    },

    /************************* deleteTask *********************/
    async deleteTask(task) {
      const authStore = useAuthStore();
      if (
        authStore.user.user_role.role === "admin" ||
        authStore.user.id === task.manager_user_id
      ) {
        try {
          const res = await fetch(`${this.myserver}/tasks/${task.id}`, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
               "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
            },
            credentials: "include",
          });

          const data = await res.json();

          if (data.errors) {
            this.errors = data.errors;
            console.log(data.errors);
          } else {
            console.log("task deleted successfully");
            // update mytasks and tasks arrays to reflect deletion
            const taskIndex = this.mytasks.findIndex((t) => t.id === task.id);
            if (taskIndex !== -1) this.mytasks.splice(taskIndex, 1);

            const taskIndex2 = this.tasks.data.findIndex((t) => t.id === task.id);
            if (taskIndex2 !== -1) this.tasks.data.splice(taskIndex2, 1);
          }
        } catch (err) {
          console.log(err.message);
        }
      } else {
        console.log("Not authorized! You cannot delete this task!");
      }
    },

    /************************* changeTaskStatus ***************/
    async changeTaskStatus(task, mystatus) {
      const authStore = useAuthStore();
      const ok = ref(false);

      if (
        authStore.user.user_role.role === "user" &&
        authStore.user.id === task.manager_user_id
      ) {
        ok.value = true;
      }

      if (task.users) {
        task.users.forEach((teamUser) => {
          if (
            authStore.user.user_role.role === "user" &&
            authStore.user.id === teamUser.id
          ) {
            ok.value = true;
          }
        });
      }

      if (ok.value === true) {
        try {
          const res = await fetch(
            `${this.myserver}/tasks/${task.id}/updateStatus`,
            {
              method: "PUT",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                 "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
              },
              body: JSON.stringify({ is_done: mystatus }),
              credentials: "include",
            }
          );

          const data = await res.json();

          if (data.errors) {
            this.errors = data.errors;
            console.log(data.errors);
          } else {
            console.log("status changed in bd", data.data.is_done);
            const xstatus = data.data.is_done;

            const taskIndex = this.mytasks.findIndex((t) => t.id === data.data.id);
            if (taskIndex !== -1) this.mytasks[taskIndex].is_done = xstatus;

            const taskIndex2 = this.tasks.data.findIndex((t) => t.id === data.data.id);
            if (taskIndex2 !== -1) this.tasks.data[taskIndex2].is_done = xstatus;
          }
        } catch (err) {
          console.log(err.message);
        }
      } else {
        console.log("Not authorized to change status for this task!");
      }
    },

    /************************* createTask *********************/     
    async createTask(formData2) {
      const authStore = useAuthStore();
      const ok = ref(false);

      if (authStore.user.user_role.role === "user") ok.value = true;

      if (ok.value === true) {
        try {
          const res = await fetch(`${this.myserver}/tasks`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
               "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
            },
            body: JSON.stringify(formData2),
            credentials: "include",
          });

          const data = await res.json();

          if (data.errors) {
            this.errors = data.errors;
          } else {
            this.router.push({ name: "tasks" });
          }
        } catch (error) {
          this.errors = error.message;
          console.error("Error creating task:", error);
        }
      } else {
        console.log("Not authorized to create tasks!");
      }
    },

    /************************* getTasks ***************/
    async getTasks(currentPage) {
      try {
        const res = await fetch(`${this.myserver}/tasks?page=${currentPage}`, {
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
          console.log(res.status);
          throw new Error("Failed to fetch tasks");
        }

        console.log("Successfully fetched tasks");
        console.log("For page " + currentPage.value);
        this.tasks = data;
        this.mytasks = data.data;
        console.log("Successfully fetched tasks:", this.tasks.value);
      } catch (error) {
        this.errors = error.message;
        console.error("Error fetching tasks:", error.message);
      }
    },
  },
});
