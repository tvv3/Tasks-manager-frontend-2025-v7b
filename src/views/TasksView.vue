<script setup>
import TaskComponent from '@/components/TaskComponent.vue';
import PaginationComponent from '@/components/PaginationComponent.vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';
import { storeToRefs } from 'pinia';
import {  onMounted,  ref, watch } from 'vue';
import { useRoute} from 'vue-router';
import { nextTick } from 'vue';
//const {errors} = storeToRefs(useTasksStore());
//const {getTaskById} = storeToRefs(useTasksStore());
//const {tasks} = storeToRefs(useTasksStore());
const {mytasks} = storeToRefs(useTasksStore());
const {user} = storeToRefs(useAuthStore());
const tasksStore = useTasksStore();
//const tasks2=tasksStore.tasks.data;
const currentPage=ref(1);//mandatory 1
const route=useRoute();

onMounted( ()=> {
 currentPage.value = route.query.page ? parseInt(route.query.page) : 1;
 tasksStore.getTasks(route.query.page ? parseInt(route.query.page) : 1);
}

);

function isNormalUser()
{
  if (!user.value) return false;
  if (!user.value.user_role) return false;
  if (!user.value.user_role.role) return false;//mandatory, at the begining we don't have the role
  return user.value.user_role.role=="user";
}

//for pagination
// Watch for route query changes (pagination clicks)
watch(() => route.query.page, (newPage) => {
  console.log("Watch triggered! Page changed to:", newPage);
  currentPage.value = newPage ? parseInt(newPage) : 1;
  tasksStore.getTasks(currentPage.value);
});

//for pagination
 
// Function to change pages manually
const changePage = (page) => {
  if (page > 0 && page <= tasksStore.tasks.last_page) {
    router.push({ query: { page } });
  }
};

</script>
<template>
    <section>
  <div class="container p-5">
    <div class="row" style="display:flex; justify-content: center; align-items: center;">
        <div class="col-md-12 col-lg-10 col-xl-10">
        <div class="card mb-3 bg-light"> <!--custom-background-->
          <div class="card-body">
            
            <div class="pt-3 pb-2 text-center">
              <div class="d-lg-flex justify-content-lg-center">
        
              <h2 class="my-4" style="text-align: center;">Tasks</h2>
              <img src="/src/images/check1.webp"
              alt="Check" width="60px" height="60px" class="my-2">
              </div>
              <template v-if="isNormalUser()===true">
              <RouterLink id="addNewTaskButton" :to="{name: 'createTask'}" class="btn btn-primary mb-4" style="border-radius: 50%; background-color: blueviolet;"><i class="bi bi-plus" style="font-size:22px;"></i></RouterLink>
              </template>
              <template v-else>
              <RouterLink id="addNewTaskButton" to="#" class="btn btn-primary mb-4" style="border-radius: 50%; background-color: gray;"><i class="bi bi-plus" style="font-size:22px;"></i></RouterLink>
             
              </template>
            </div>
            
            <table class="table table-responsive mb-4" style="margin-left: auto;margin-right: auto;">
              <thead>
                <tr>
                  <th scope="col">Manager</th>
                  <th scope="col">Task</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="mytasks"> 
                  <template v-if="mytasks.length>0">       
                   <TaskComponent v-for="(task, index) in mytasks" :task="task"
                    :index="index+1"  :key="task.id" />
                   
                </template>
                </template>
              </tbody>
            </table>

       <PaginationComponent  :elements="tasksStore.tasks" :currentPage="currentPage"
        :changePage="changePage" 
       /> 

          </div>
        </div>

      </div>
    </div>
</div>
</section>
</template>
<style>

.custom-background{
  background: rgba(126, 64, 246, 1)!important;
  border:none!important;
  border-radius: 2em!important;
  
  border: 2px solid rgba(255, 255, 255, 0.05)!important;
  
  box-shadow: 10px 10px 10px rgba(46, 54, 68, 0.03)!important;
} 

table {border-radius: 2em!important;}
tr, td{
  background-color: rgba(24, 24, 16, 0.2)!important;
  color:white!important;
}

th{
  background-color: rgba(126, 64, 246, 0.8)!important;
  color:white!important;
}

 tr,th:first-of-type {
  border-top-left-radius: 2em!important;
  }

  tr,th:last-of-type {
  border-top-right-radius: 2em!important;
  }
  
  tr:last-of-type, tr:last-of-type td:first-child   {
  border-bottom-left-radius: 2em!important;
  }

  tr:last-of-type, tr:last-of-type td:last-child  {
  border-bottom-right-radius: 2em!important;
  }

  
  
</style>