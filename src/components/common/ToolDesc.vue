<template>
  <div class="tool_detail_desc">
    <div class="tool_detail_desc_title">
      <div class="tool_detail_desc_title_content">
        <i class="ri-at-fill"></i>
        <span class="text">工具使用说明</span>
      </div>
    </div>
    <div class="tool_detail_desc_content">
      <slot></slot>
      <div class="tool_desc_container">
        <ul>
          <li v-for="(item, index) in props.toolDesc" :key="index">{{ item }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  toolDesc: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped lang="scss">
.tool_detail_desc {
  background: var(--xz-secondbg);
  border-radius: 12px;
  padding: 12px;
  line-height: 1.3;
  border: var(--style-border-always);
  box-shadow: var(--xz-shadow-border);
  margin-bottom: 12px;

  .tool_detail_desc_title {
    display: flex;
    color: var(--xz-lighttext);
    border-radius: 8px;
    align-items: center;
    padding: 0 12px;
    cursor: default;
    user-select: none;

    .tool_detail_desc_title_content {
      display: flex;
      align-items: center;
      color: var(--xz-lighttext);
    }

    i {
      width: 24px;
      height: 24px;
      display: flex;
      background: var(--xz-lighttext);
      color: var(--xz-card-bg);
      font-size: 14px;
      border-radius: 20px;
      justify-content: center;
      align-items: center;
    }

    .text {
      font-weight: 700;
      margin-left: 8px;
      line-height: 1;
      font-size: 14px;
    }
  }

  .tool_detail_desc_content {
    margin-top: 12px;
    padding: 8px 12px;
    background: var(--xz-card-bg);
    border-radius: 8px;
    border: var(--style-border-always);
    font-size: 15px;
    line-height: 1.4;
    display: flex;
    text-align: left;
    color: var(--xz-fontcolor);

    ul {
      margin-top: 0.4rem;
      list-style: none;
      counter-reset: li 0;
      display: block;
      margin: 0;
      padding: 0;

      li {
        padding: 0.2em 0.2em 0.2em 1.4em;
        position: relative;
        margin: 0.2rem 0;

        &::before {
          left: 0;
          top: 50%;
          width: 0.7rem;
          height: 0.7rem;
          border-radius: 0.7rem;
          background: 0 0;
          content: '';
          line-height: 0.7rem;
          border: 0.2rem solid var(--xz-lighttext);
          cursor: default;
          position: absolute;
          color: #fff;
          transform: translateY(-50%);
        }
      }
    }
  }
}
</style>
