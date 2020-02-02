<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar">
        <img src="../assets/logo.png" alt />
      </div>
      <el-form class="form_login" :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-mima" v-model="form.password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
@Component
export default class Login extends Vue {
  msg: string = '123'
  form = {
    username: '',
    password: ''
  }
  rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入用户密码', trigger: 'blur' },
      { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
    ]
  }

  async login() {
    let result = await (this.$refs.formRef as any)
      .validate()
      .catch((err: any) => err)
    console.log(result)
    if (!result) {
      return
    }
    const { data: res } = await (this as any).$http.post('/login', this.form)
    if (res.meta.status !== 200) {
      return this.$message.error('登录失败')
    }
    this.$message.success('登录成功')
    window.sessionStorage.setItem('token', res.data.token)
    this.$router.push('/home')
  }
  resetForm(): void {
    ;(this.$refs.formRef as any).resetFields()
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: gray;
  height: 100%;
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avatar {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      background-color: #fff;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px #ddd;
      img {
        height: 100%;
        width: 100%;
        background-color: #eee;
        border-radius: 50%;
      }
    }
    .form_login {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
