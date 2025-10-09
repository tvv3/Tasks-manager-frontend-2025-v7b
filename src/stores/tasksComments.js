import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import { ref } from "vue";

export const useTasksCommentsStore = defineStore("TasksCommentsStore", {
  state: () => ({
    errors: {},
    comment_id: null, //for update and delete
    tasksComments: ref({data:[]}),
    myserver: "http://localhost:8000/api",
  }),

  actions: {
    /************************* createTaskComment *********************/
    async createTaskComment(task, user, formCommentData2) {
      this.comment_id = null;
      const ok = ref(false);

      if (user.user_role.role === "user") ok.value = true;

      if (ok.value === true) {
        try {
          const formData = { task_id: task.id, comment: formCommentData2.comment };
          const res = await fetch(`${this.myserver}/tasksComments`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
            },
            body: JSON.stringify(formData),
            credentials: "include", // send cookies automatically
          });

          const data = await res.json();

          if (!res.ok) {
            this.errors = { task: [data.message || "Failed to create comment"] };
            if (res.status === 422) {
              this.errors = data.errors || { task: ["Error at adding a comment"] };
            }
            return false;
          } else if (data !== null && !(Array.isArray(data) && data.length === 0)) {
            if (data.errors) {
              this.errors = data.errors;
              return false;
            } else {
              if (data.message) {
                this.errors = { task: [data.message] };
                return false;
              } else {
                this.errors = {};
                console.log("Successfully added new task's comment");
                return true;
              }
            }
          } else {
            this.errors = { task: ["Comment not created!"] };
            return false;
          }
        } catch (error) {
          this.errors = { task: ["Network error or server is unreachable. " + error.message] };
          return false;
        } finally {
          console.log("end createTaskComment");
        }
      } else {
        this.errors = { task: ["Not authorized to create comments for this task!"] };
        return false;
      }
    },

    /************************* getTasksComments ***************/
    async getTasksComments(task, currentPage) {
      this.comment_id = null;
      const authStore = useAuthStore();
      this.tasksComments.data =[];//initializare
      if (
        authStore.user.user_role.role === "admin" ||
        authStore.user.id === task.manager_user_id ||
        (task.users && task.users.find((u) => u.id === authStore.user.id))
      ) {
        try {
          const res = await fetch(`${this.myserver}/tasksComments/list/${task.id}?page=${currentPage}`, {
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
            this.errors = { task: [data.message || "Error fetching comments"] };
          } else if (data !== null && !(Array.isArray(data) && data.length === 0)) {
            if (data.errors) {
              this.errors = data.errors;
            } else if (data.message) {
              this.errors = { task: [data.message] };
            } else {
              this.errors = {};
              this.tasksComments = data;
              console.log("Successfully fetched task's comments for page " + currentPage);
            }
          } else {
            this.errors = { task: ["No comments fetched for this page!"] };
          }
        } catch (error) {
          this.errors = { task: ["Network error or server is unreachable. " + error.message] };
        } finally {
          console.log("end getTasksComments");
        }
      } else {
        this.errors = { task: ["Not authorized to fetch the comments of this task!"] };
      }
    },

    /************************* editTasksComment ***************/
    async editTasksComment(task_id, comment, newCommentValue) {
      this.comment_id = comment.id;
      const authStore = useAuthStore();

      if (
        authStore.user.user_role.role === "user" &&
        authStore.user.id === comment.user.id &&
        task_id === comment.task_id
      ) {
        try {
          const res = await fetch(`${this.myserver}/tasksComments/${comment.id}`, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
            },
            body: JSON.stringify({ comment: newCommentValue, task_id }),
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok) {
            this.errors = { comment: [data.message || "Error updating comment"] };
            if (res.status === 422) {
              this.errors = data.errors || { comment: ["Error at update"] };
            }
          } else if (data !== null && !(Array.isArray(data) && data.length === 0)) {
            if (data.errors) {
              this.errors = data.errors;
            } else {
              if (!data.data.comment || !data.data.updated_at) {
                this.errors = { comment: ["Error at update! Incorrect data fetched!"] };
              } else {
                this.errors = {};
                const index = this.tasksComments.data.findIndex((c) => c.id === comment.id);
                if (index !== -1) {
                  this.tasksComments.data[index].comment = data.data.comment;
                  this.tasksComments.data[index].updated_at = data.data.updated_at;
                }
              }
            }
          } else {
            this.errors = { comment: ["Error at comment update! No data fetched!"] };
          }
        } catch (error) {
          this.errors = { comment: ["Network error or server is unreachable. " + error.message] };
        } finally {
          console.log("end editTasksComment");
        }
      } else {
        this.errors = { comment: ["Not authorized to edit this comment!"] };
      }
    },

    /************************* deleteTasksComment ***************/
    async deleteTasksComment(comment) {
      this.comment_id = comment.id;
      const authStore = useAuthStore();

      if (
        (authStore.user.user_role.role === "user" && authStore.user.id === comment.user_id) ||
        authStore.user.user_role.role === "admin"
      ) {
        try {
          const res = await fetch(`${this.myserver}/tasksComments/${comment.id}`, {
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
            this.errors = { comment: [data.message || "Error deleting comment"] };
            console.log(1);
          } else if (data !== null && !(Array.isArray(data) && data.length === 0)) {
            if (data.errors) {
              this.errors = data.errors;
              console.log(2);
            } else {
              this.errors = {};
              const index = this.tasksComments.data.findIndex((c) => c.id === comment.id);
              if (index !== -1) {
                this.tasksComments.data.splice(index, 1);
              }
              console.log("Successfully deleted comment:", data.message || "");
              console.log(3);
              return true;
            }
          } else {
            this.errors = { comment: ["Error at comment delete! No data fetched!"] };
            console.log(4);
          }
        } catch (error) {
          this.errors = { comment: ["Network error or server is unreachable. " + error.message] };
          console.log(5);
        } finally {
          console.log("end deleteTasksComment");
        }
      } else {
        this.errors = { comment: ["Not authorized! You cannot delete this comment!"] };
        console.log('6');
      }

      return false;//on any error if not returned true already; 

    },
  },
});
