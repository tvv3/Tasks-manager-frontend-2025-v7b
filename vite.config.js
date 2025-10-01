import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },//resolve

  //added by me: (will be changed in production) must use " not ' below
  server: {
     port:3000,

     /*
     proxi: {
      "/api":{
        target: "http://localhost:8000",
        changeOrigin: true,
       // secure:false,

        
       // rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        //end settings for proxi
      },
     },*/
  },

})
