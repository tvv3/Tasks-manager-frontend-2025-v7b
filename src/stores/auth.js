import { defineStore } from "pinia";


export const useAuthStore = defineStore("AuthStore", {
  state: () => ({
    user: null,
    errors: {},
    successMessage: null,
    apiBase: "http://localhost:8000/api",
  }),

  actions: {
    
    // Fetch logged-in user
    async getUser() {
      try {
       
        console.log('getUser');
        //2 The actual getUser 
        const res = await fetch(`${this.apiBase}/user`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include", // important for session
        });

        const data = await res.json();
        if (res.ok) {
          console.log('data get user=',data);
          this.user = data.user;
          this.errors = {};
        } else {
          this.user = null;
          console.log('1');
        }
      } catch (err) {
        this.user = null;
        console.error("2 getUser error:", err.message);
      }
    },

    // Login user
    async authenticate(formData) {
  this.successMessage = null;
  this.errors = {};

  // Validare minimă formData
  if (!formData.email || !formData.password) {
    this.errors = { email: ["Email și parola sunt obligatorii"] };
    return;
  }

  try {
    // 1️⃣ Obține CSRF cookie (necesar pentru Laravel Sanctum)
    await fetch(`${this.apiBase}/sanctum/csrf-cookie`, {
      credentials: "include",
    });

    //const token = this.getCookie("XSRF-TOKEN");

    // 2️⃣ Trimite POST la /login
    const res = await fetch(`${this.apiBase}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
         "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      // Laravel poate returna errors sau message
      this.errors = data.errors || { email: [data.message || "Login failed"] };
      this.user = null;
    } else {
      // Login reușit
      this.errors = {};
      console.log('data.user=',data.user);
      this.user = data.user; // Laravel poate returna user
      this.successMessage = "Successfully logged in!";
      
      // Redirect către home
      if (this.router) {
        this.router.push({ name: "home" });
      }

      // Opțional: fetch user din sesiune
      // await this.getUser();
    }
  } catch (err) {
    this.errors = { email: ["Network error: " + err.message] };
    this.user = null;
  }
},


    // Logout user
    async logout() {
      this.successMessage = null;
      this.errors = {};

      try {
        // POST logout
        //const token = this.getCookie("XSRF-TOKEN");
        const res = await fetch(`${this.apiBase}/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
             "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
          },
          credentials: "include",
        });

        if (res.ok) {
          this.user = null;
          this.successMessage = "Logged out successfully!";
          if (this.router) {
            this.router.push({ name: "home" });//mandatory
             }
        } else {
          const data = await res.json();
          this.errors = { logout: [data.message || "Logout failed"] };
        }
      } catch (err) {
        this.errors = { logout: ["Network error: " + err.message] };
      }
    },

    // Register user
    async registerUser(formData) {
      this.successMessage = null;
      this.errors = {};

      try {
       // await fetch(`${this.apiBase}/sanctum/csrf-cookie`, { credentials: "include" });
        //await this.getUser();
        const token = this.getCookie("XSRF-TOKEN");
        const res = await fetch(`${this.apiBase}/registerUser`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN"),
          },
          credentials: "include",
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          this.errors = data.errors || { form: [data.message || "Registration failed"] };
          console.log('register:1', data);
          
        } else {
          this.errors = {};
          this.successMessage = "User registered successfully!";
          console.log('register:2');
          //await this.getUser();
        }
      } catch (err) {
        this.errors = { form: ["Network error: " + err.message] };
        console.log('register:3');
      }
    },

    // Change password (only for admin)
    async changePassword(formData) {
      this.successMessage = null;
      this.errors = {};

      try {
        //await fetch(`${this.apiBase}/sanctum/csrf-cookie`, { credentials: "include" });
        const token = this.getCookie("XSRF-TOKEN");
        const res = await fetch(`${this.apiBase}/changePassword`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
             "X-XSRF-TOKEN": token,
          },
          credentials: "include",
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          this.errors = data.errors || { form: [data.message || "Password change failed"] };
        } else {
          this.errors = {};
          this.successMessage = "Password changed successfully!";
        }
      } catch (err) {
        this.errors = { form: ["Network error: " + err.message] };
      }
    },
  },
});
