<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="用户名" width="180"></el-table-column>
        <el-table-column prop="mobile" label="手机" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="150"></el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="160">
          <template v-slot:default="slotProps">{{slotProps.row.create_time | fmtTime}}</template>
        </el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot:default="slotProps">
            <el-switch
              v-model="slotProps.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handleChange(slotProps.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot:default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户 -->
    <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class Users extends Vue {
  queryInfo = {
    query: '',
    pagenum: 1,
    pagesize: 2
  }
  userList = []
  total: number = 0
  // 是否显示添加用户对话框
  addDialogVisible: boolean = false
  // 是否显示编辑用户对话框
  editDialogVisible: boolean = false
  // 添加用户的对象
  addForm = {
    username: '',
    password: '',
    email: '',
    mobile: ''
  }
  // 验证邮箱
  checkEmail = (rule: any, value: string, callback: Function) => {
    const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    if (regEmail.test(value)) {
      callback()
    }
    return callback(new Error('邮箱格式不正确'))
  }
  // 验证手机号
  checkMobile = (rule: any, value: string, callback: Function) => {
    const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
    if (regMobile.test(value)) {
      callback()
    }
    return callback(new Error('手机号码格式不正确'))
  }
  // 添加用户规则
  addFormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      {
        validator: this.checkEmail,
        trigger: 'blur'
      }
    ],
    mobile: [
      { required: true, message: '请输入电话', trigger: 'blur' },
      { validator: this.checkMobile, trigger: 'blur' }
    ]
  }
  editForm: any = {}
  editFormRules = {
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      {
        validator: this.checkEmail,
        trigger: 'blur'
      }
    ],
    mobile: [
      { required: true, message: '请输入电话', trigger: 'blur' },
      { validator: this.checkMobile, trigger: 'blur' }
    ]
  }
  // 获取用户列表公共方法
  async getUserList() {
    const { data: res } = await (this as any).$http.get('/users', {
      params: this.queryInfo
    })
    if (res.meta.status !== 200) {
      return this.$message.error('获取用户列表数据失败')
    }
    this.userList = res.data.users
    this.total = res.data.total
  }
  // 打开编辑用户对话框
  async showEditDialog(id: number) {
    const { data: res } = await (this as any).$http.get('users/' + id)
    if (res.meta.status != 200) {
      return this.$message.error('获取用户失败')
    }
    this.editForm = res.data
    this.editDialogVisible = true
  }
  // 关闭添加用户对话框
  addDialogClosed() {
    ;(this.$refs['addFormRef'] as any).resetFields()
  }
  // 添加用户
  async addUser() {
    let result = await (this.$refs.addFormRef as any)
      .validate()
      .catch((err: any) => err)
    console.log(result)
    if (!result) {
      return
    }
    const { data: res } = await (this as any).$http.post('/users', this.addForm)
    if (res.meta.status != 201) {
      return this.$message.error('添加用户失败')
    }
    this.addDialogVisible = false
    this.getUserList()
    this.$message.success('添加用户成功')
  }
  // 编辑用户
  async editUser() {
    let result = await (this.$refs.editFormRef as any)
      .validate()
      .catch((err: any) => err)
    if (!result) {
      return
    }
    const { data: res } = await (this as any).$http.put(
      '/users/' + this.editForm.id,
      {
        email: this.editForm.email,
        mobile: this.editForm.mobile
      }
    )
    if (res.meta.status != 200) {
      return this.$message.error('修改用户信息失败')
    }
    this.editDialogVisible = false
    this.getUserList()
    this.$message.success('修改用户信息成功')
  }
  // 关闭编辑对话框
  editDialogClosed() {
    ;(this.$refs['editFormRef'] as any).resetFields()
  }
  // 删除用户
  removeById(id: number) {
    this.$confirm('删除用户?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        const { data: res } = await (this as any).$http.delete('users/' + id)
        if (res.meta.status != 200) {
          return this.$message.info('删除失败')
        }
        this.getUserList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
      .catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
  }
  showRoleDialog(id: number) {}
  // 改变用户状态
  async handleChange(userinfo: any) {
    const { data: res } = await (this as any).$http.put(
      `users/${userinfo.id}/state/${userinfo.mg_state}`
    )
    console.log(res)
    if (res.meta.status != 200) {
      userinfo.mg_state = !userinfo.mg_state
      return this.$message.error('修改用户状态失败')
    }
    this.$message.success('成功修改用户状态')
  }
  // 每页数量
  handleSizeChange(newSize: number) {
    // console.log(newSize)
    this.queryInfo.pagesize = newSize
    this.getUserList()
  }
  // 页码改变
  handleCurrentChange(currentPage: number) {
    this.queryInfo.pagenum = currentPage
    this.getUserList()
  }
  // 声明周期函数
  created() {
    this.getUserList()
  }
}
</script>
