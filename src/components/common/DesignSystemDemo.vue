<template>
  <div class="design-system-demo">
    <h2>设计系统演示</h2>
    
    <!-- 颜色演示 -->
    <section class="color-section">
      <h3>色彩系统</h3>
      <div class="color-grid">
        <div class="color-item bg-primary">
          <span>Primary</span>
        </div>
        <div class="color-item bg-primary-light">
          <span>Primary Light</span>
        </div>
        <div class="color-item bg-primary-dark">
          <span>Primary Dark</span>
        </div>
        <div class="color-item bg-accent">
          <span>Accent</span>
        </div>
        <div class="color-item bg-success">
          <span>Success</span>
        </div>
        <div class="color-item bg-warning">
          <span>Warning</span>
        </div>
        <div class="color-item bg-error">
          <span>Error</span>
        </div>
      </div>
    </section>

    <!-- 渐变演示 -->
    <section class="gradient-section">
      <h3>渐变背景</h3>
      <div class="gradient-grid">
        <div class="gradient-item bg-gradient-primary">
          <span>Primary Gradient</span>
        </div>
        <div class="gradient-item bg-gradient-accent">
          <span>Accent Gradient</span>
        </div>
        <div class="gradient-item bg-gradient-success">
          <span>Success Gradient</span>
        </div>
      </div>
    </section>

    <!-- 按钮演示 -->
    <section class="button-section">
      <h3>按钮样式</h3>
      <div class="button-grid">
        <button class="btn-primary">Primary Button</button>
        <button class="btn-gradient">Gradient Button</button>
        <button class="btn-outline">Outline Button</button>
      </div>
    </section>

    <!-- 卡片演示 -->
    <section class="card-section">
      <h3>卡片样式</h3>
      <div class="card-grid">
        <div class="demo-card hover-lift">
          <h4>悬停卡片</h4>
          <p>这是一个带有悬停效果的卡片</p>
        </div>
        <div class="demo-card shadow-lg">
          <h4>阴影卡片</h4>
          <p>这是一个带有大阴影的卡片</p>
        </div>
      </div>
    </section>

    <!-- 间距演示 -->
    <section class="spacing-section">
      <h3>间距系统</h3>
      <div class="spacing-demo">
        <div class="spacing-item p-xs bg-light">padding-xs</div>
        <div class="spacing-item p-sm bg-light">padding-sm</div>
        <div class="spacing-item p-md bg-light">padding-md</div>
        <div class="spacing-item p-lg bg-light">padding-lg</div>
        <div class="spacing-item p-xl bg-light">padding-xl</div>
      </div>
    </section>

    <!-- 字体演示 -->
    <section class="typography-section">
      <h3>字体系统</h3>
      <div class="text-xs">Extra Small Text (12px)</div>
      <div class="text-sm">Small Text (14px)</div>
      <div class="text-base">Base Text (16px)</div>
      <div class="text-lg">Large Text (18px)</div>
      <div class="text-xl">Extra Large Text (20px)</div>
      <div class="text-2xl">2XL Text (24px)</div>
      <div class="text-3xl">3XL Text (32px)</div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'DesignSystemDemo'
}
</script>

<style lang="scss" scoped>
.design-system-demo {
  padding: $spacing-xl;
  max-width: 1200px;
  margin: 0 auto;

  h2 {
    text-align: center;
    margin-bottom: $spacing-2xl;
    @include gradient-bg(135deg, $primary-color, $accent-color);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  section {
    margin-bottom: $spacing-2xl;

    h3 {
      margin-bottom: $spacing-lg;
      color: $text-primary;
      font-weight: 600;
    }
  }
}

.color-section {
  .color-grid {
    @include responsive-grid(2, 3, 4, 5, 7);
    gap: $spacing-md;

    .color-item {
      height: 80px;
      border-radius: 8px;
      @include flex-center();
      color: white;
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
  }
}

.gradient-section {
  .gradient-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-md;

    .gradient-item {
      height: 100px;
      border-radius: 12px;
      @include flex-center();
      color: white;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
  }
}

.button-section {
  .button-grid {
    display: flex;
    gap: $spacing-md;
    flex-wrap: wrap;

    .btn-primary {
      @include button-style($primary-color, white, $primary-dark);
    }

    .btn-gradient {
      @include gradient-button(135deg, $primary-color, $accent-color);
    }

    .btn-outline {
      background: transparent;
      color: $primary-color;
      border: 2px solid $primary-color;
      border-radius: 8px;
      padding: $spacing-sm $spacing-md;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        background: $primary-color;
        color: white;
        transform: translateY(-1px);
      }
    }
  }
}

.card-section {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: $spacing-lg;

    .demo-card {
      background: $card-background;
      padding: $spacing-lg;
      border-radius: 12px;
      border: 1px solid $border-color;

      h4 {
        margin-bottom: $spacing-sm;
        color: $text-primary;
      }

      p {
        color: $text-secondary;
        margin: 0;
      }
    }
  }
}

.spacing-section {
  .spacing-demo {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .spacing-item {
      border-radius: 4px;
      font-family: monospace;
      font-size: $font-size-sm;
      color: $text-primary;
    }
  }
}

.typography-section {
  > div {
    margin-bottom: $spacing-sm;
    color: $text-primary;
  }
}

// 响应式调整
@include max-width($breakpoint-md) {
  .design-system-demo {
    padding: $spacing-lg;
  }

  .button-section .button-grid {
    flex-direction: column;
    align-items: flex-start;

    button {
      width: 100%;
    }
  }
}
</style>