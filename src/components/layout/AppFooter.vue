<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- 主要内容区域 -->
      <div class="footer-content">
        <!-- 公司信息 -->
        <div class="footer-section">
          <h3 class="footer-title">在线商城</h3>
          <p class="footer-description">
            为年轻人打造的现代化购物平台，提供优质商品和贴心服务。
          </p>
          <div class="footer-social">
            <el-icon class="social-icon"><ChatDotRound /></el-icon>
            <el-icon class="social-icon"><Share /></el-icon>
            <el-icon class="social-icon"><Star /></el-icon>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="footer-section">
          <h4 class="footer-subtitle">快速链接</h4>
          <ul class="footer-links">
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/category">商品分类</router-link></li>
            <li><router-link to="/cart">购物车</router-link></li>
            <li><router-link to="/search">搜索</router-link></li>
          </ul>
        </div>

        <!-- 客户服务 -->
        <div class="footer-section">
          <h4 class="footer-subtitle">客户服务</h4>
          <ul class="footer-links">
            <li><a href="#" @click.prevent>帮助中心</a></li>
            <li><a href="#" @click.prevent>售后服务</a></li>
            <li><a href="#" @click.prevent>配送说明</a></li>
            <li><a href="#" @click.prevent>退换货政策</a></li>
          </ul>
        </div>

        <!-- 联系我们 -->
        <div class="footer-section">
          <h4 class="footer-subtitle">联系我们</h4>
          <div class="footer-contact">
            <p><el-icon><Phone /></el-icon> 400-123-4567</p>
            <p><el-icon><Message /></el-icon> service@mall.com</p>
            <p><el-icon><Clock /></el-icon> 9:00-18:00 (工作日)</p>
          </div>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <div class="footer-bottom">
        <div class="footer-copyright">
          <p>&copy; 2024 在线商城. 保留所有权利.</p>
          <p class="footer-tech">基于 Vue 3 + Vite 构建</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ChatDotRound, Share, Star, Phone, Message, Clock } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.app-footer {
  background: var(--text-primary);
  color: #ffffff;
  margin-top: auto;

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem 1rem;

    @media (max-width: 768px) {
      padding: 1.5rem 0.75rem 1rem;
    }
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
  }

  .footer-section {
    .footer-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--primary-light);
      background: linear-gradient(135deg, var(--primary-light), var(--accent-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .footer-subtitle {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #ffffff;
    }

    .footer-description {
      color: #bdc3c7;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .footer-social {
      display: flex;
      gap: 1rem;

      .social-icon {
        font-size: 1.5rem;
        color: var(--primary-light);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          color: var(--accent-light);
          transform: translateY(-2px);
        }
      }
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 0.5rem;

        a {
          color: #bdc3c7;
          text-decoration: none;
          transition: color 0.3s ease;

          &:hover {
            color: var(--primary-light);
          }
        }
      }
    }

    .footer-contact {
      p {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        color: #bdc3c7;

        .el-icon {
          color: var(--primary-light);
          font-size: 1.125rem;
        }
      }
    }
  }

  .footer-bottom {
    border-top: 1px solid #34495e;
    padding-top: 1rem;

    .footer-copyright {
      text-align: center;
      color: #95a5a6;

      p {
        margin: 0.25rem 0;
        font-size: 0.875rem;
      }

      .footer-tech {
        font-size: 0.75rem;
        opacity: 0.8;
      }
    }
  }
}
</style>