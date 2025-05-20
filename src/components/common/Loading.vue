<template>
  <div class="loadingio-spinner-ripple-2by998twmg9">
    <div class="ldio-yzaezf3dcml">
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
@keyframes ldio-yzaezf3dcml {
  0% {
    top: 96px;
    left: 96px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 18px;
    left: 18px;
    width: 156px;
    height: 156px;
    opacity: 0;
  }
}
.ldio-yzaezf3dcml div {
  position: absolute;
  border-width: 4px;
  border-style: solid;
  opacity: 1;
  border-radius: 50%;
  animation: ldio-yzaezf3dcml 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.ldio-yzaezf3dcml div:nth-child(1) {
  border-color: #e90c59;
  animation-delay: 0s;
}
.ldio-yzaezf3dcml div:nth-child(2) {
  border-color: #46dff0;
  animation-delay: -0.5s;
}
.loadingio-spinner-ripple-2by998twmg9 {
  width: 200px;
  height: 200px;
  display: inline-block;
  overflow: hidden;
  background: rgba(255, 255, 255, 0);
}
.ldio-yzaezf3dcml {
  width: 100%;
  height: 100%;
  position: relative;
  transform: translateZ(0) scale(1);
  backface-visibility: hidden;
  transform-origin: 0 0; /* see note above */
}
.ldio-yzaezf3dcml div {
  box-sizing: content-box;
}
</style>
