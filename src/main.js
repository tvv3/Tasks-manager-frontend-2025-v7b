import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import './assets/main.css';

import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia';
import { useAuthStore } from './stores/auth';

import App from './App.vue';
import router from './router';

// Create Vue app
const app = createApp(App);

// Pinia
const pinia = createPinia();
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
}
pinia.use(({ store }) => {
  store.router = markRaw(router); // make router reactive-safe
  store.getCookie=getCookie;
});
app.use(pinia);




// Initialize auth store
const authStore = useAuthStore();

// First, fetch user from session (if logged in)
// Fetch CSRF cookie first
/*
fetch('http://localhost:8000/api/sanctum/csrf-cookie', {
    method: 'GET',
    credentials: 'include'  // important for sending cookies
}).then(() => {
    // Now safe to get user
    //return authStore.getUser();
}).finally(() => {
 */  
    app.use(router);
    app.mount('#app');
//});
