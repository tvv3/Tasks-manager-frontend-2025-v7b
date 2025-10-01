<script setup>
import { RouterLink } from 'vue-router'; 
const props=defineProps(['task']);//or if is finished blueviolet color !!!

</script>
<template>
     <div class="card m-4" style="background-color: whitesmoke;">
        <div class="card-body m-1">
     <div class="ms-1 small"><strong>Manager: </strong><span>{{props.task.manager.name}}</span></div>
                  
     <div class="ms-1 mb-1 mt-1"><strong>Task: </strong><span style="color:blueviolet;"><strong>{{props.task.title}}</strong></span></div>           
      
     <div class="ms-1 d-flex justify-content-between">
                    <div>
                        <h6 class="mb-0"><span class="badge" :style="`${'color:white!important; ' + ((props.task.is_done===false)?'background-color:green!important;':'background-color:blueviolet!important;')}`">{{ (props.task.is_done===false)? 'Opened':'Finished' }}</span></h6>
                     </div>
                   
      </div>
    </div>
     </div> <!--container-->            
</template>
<style scoped>

</style>