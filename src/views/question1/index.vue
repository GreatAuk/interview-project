<template>
  <h1>Question1: - 请完成代码</h1>

  <div class="bg-white p-5" v-loading="loadingFlag" >

    <div class="flex items-center justify-between">
      <el-button type="primary" @click="handleClickBtn('add')">新增</el-button>
      <el-input v-model="searchTitle" clearable placeholder="搜索标题" @keyup.enter.native="initTableData(1)" @clear="initTableData(1)" class="w-48">
        <template #append>
          <el-button @click="initTableData(1)">搜索</el-button>
        </template>
      </el-input>
    </div>

    <el-table :data="tableData" class="my-5">
      <el-table-column label="序号" width="100">
        <template #default="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="createTime" label="创建时间">
        <template #default="scope">{{ dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</template>
      </el-table-column>
      <el-table-column label="" width="120">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleClickBtn('edit', scope.row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="handleClickBtn('delete', scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-center">
      <el-pagination
        v-model:current-page="currentpage"
        v-model:page-size="pagesize"
        :page-sizes="[1, 2, 4, 10]"
        layout="sizes, prev, pager, next, total"
        :total="total"
        background
        @size-change="initTableData(1)"
        @current-change="initTableData()"
      />
    </div>

  </div>

  <el-dialog v-model="dialogData.show" :title="dialogData.title" label-width="120px">
    <div v-loading="dialogData.loading">
      <el-form ref="dialogForm" :model="dialogData.form" :rules="dialogRules">
        <el-form-item label="标题" prop="titleInput">
          <el-input v-model="dialogData.form.titleInput" autocomplete="off" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="contentInput">
          <el-input v-model="dialogData.form.contentInput" maxlength="130" placeholder="请输入内容" :autosize="{ minRows: 6 }" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>
      <div class="text-right">
        <el-button @click="dialogData.show = false">取消</el-button>
        <el-button type="primary" @click="handleClickDialog('commitDialog', dialogForm)">提交</el-button>
      </div>
    </div>
  </el-dialog>

</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getPosts, addPost, updatePost, getPost, deletePost } from '@/api/post'

  const tableData = ref([])
  const searchTitle = ref('')
  const pagesize = ref(2)
  const currentpage = ref(1)
  const total = ref(0)
  const loadingFlag = ref(false)
  
  const dialogData = reactive({
    show: false,
    loading: false,
    title: '',
    type: '',
    form: {
      id: '',
      titleInput: '',
      contentInput: '',
    }
  })

  const dialogForm = ref<FormInstance>()
  const dialogRules = reactive<FormRules>({
    titleInput: [{ required: true, message: '请输入标题', trigger: 'change' }],
    contentInput: [
      { required: true, message: '请输入内容', trigger: 'change' },
      { min: 3, max: 130, message: '内容长度为3~130个字', trigger: 'change' },
    ]
  })

  onMounted(() => {
    initTableData(1)
  })

  function initTableData(pageNum?: number){
    loadingFlag.value = true
    if(pageNum) currentpage.value = 1
    getPosts({current: currentpage.value, pageSize:pagesize.value, text: searchTitle.value}).then((resq: any)=>{
      const res = resq?.data?.data
      tableData.value = res.list
      total.value = res.total
      loadingFlag.value = false
    }).catch(()=>{
      loadingFlag.value = false
    })
  }

  function handleClickBtn(type: string, row?: any){
    const typeMap: { [index: string]: Function }  = {
      'add': ()=>{
        dialogData.title = '新增Post'
        dialogData.form.id = ''
        dialogData.form.titleInput = ''
        dialogData.form.contentInput = ''
        dialogData.type = 'add'
        handleClickDialog('openDialog')
      },
      'edit': () => {
        dialogData.title = '修改Post'
        dialogData.form.id = row.id
        dialogData.form.titleInput = row.title
        dialogData.form.contentInput = row.content
        dialogData.type = 'edit'
        handleClickDialog('openDialog')
      },
      'delete': () => {
        ElMessageBox.confirm(`请问确定要删除${row.title}吗？`,'提示',{
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose:function(action, instance, done){
            if(action==='confirm'){
              instance.confirmButtonLoading = true
              deletePost({ id: row.id }).then(()=>{
                instance.confirmButtonLoading = false
                done()
                ElMessage({ type: 'success', message: '删除成功！'})
                initTableData()
              }).catch(()=>{
                instance.confirmButtonLoading = false
                ElMessage({ type: 'error', message: '删除失败！'})
              })
            }else{
              done()
            }
          }
        }).then(() => {}).catch(() => {})
      },
    }
    typeMap[type] && typeMap[type]()
  }
  function handleClickDialog(type: string, formEl?: FormInstance | undefined){
    const typeMap: { [index: string]: Function }  = {
      'openDialog': ()=>{
        dialogData.show = true
      },
      'commitDialog': async () => {
        if (!formEl) return
        await formEl.validate((valid, fields) => {
          if (valid) {
            dialogData.loading = true
            const apibody = {
              title: dialogData.form.titleInput,
              content: dialogData.form.contentInput
            }
            if(dialogData.type==='edit'){
              apibody.id = dialogData.form.id
              updatePost(apibody).then(()=>{
                ElMessage({ type: 'success', message: '编辑成功！'})
                dialogData.show = false
                initTableData()
              }).catch(()=>{
                ElMessage({ type: 'success', message: '编辑失败！'})
              }).finally(()=>{
                dialogData.loading = false
              })
            }else{
              addPost(apibody).then(()=>{
                ElMessage({ type: 'success', message: '新增成功！'})
                dialogData.show = false
                initTableData()
              }).catch(()=>{
                ElMessage({ type: 'success', message: '新增失败！'})
              }).finally(()=>{
                dialogData.loading = false
              })
            }
          }
        })
      },
    }
    typeMap[type] && typeMap[type]()
  }
</script>
