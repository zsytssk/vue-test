<template>
  <div></div>
</template>

<script setup lang="ts">
import * as z from 'zod/v4'
const schema = z.string().refine((val) => val.length > 8, {
  error: 'Too short!',
})

try {
  schema.parse('12345678')
} catch (error) {
  console.log((error as z.ZodError).issues)
}

const schema2 = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      return Number.parseInt(val) // 把 "123" → 123
    }
    return val // 其他类型保持原样
  },
  z.int({ error: 'Not a number' }),
)

try {
  schema2.parse('ddd')
} catch (error) {
  console.log((error as z.ZodError).issues)
}

const schema3 = z.string().check((ctx) => {
  if (ctx.value.length === 0) {
    ctx.issues.push({
      code: 'custom',
      message: '不能为空',
      input: ctx.value,
    })
  } else if (Number.isNaN(parseInt(ctx.value))) {
    ctx.issues.push({
      code: 'custom',
      message: '请输入数字',
      input: ctx.value,
    })
  } else if (!Number.isInteger(Number(ctx.value))) {
    ctx.issues.push({
      code: 'custom',
      message: '不是整数',
      input: ctx.value,
    })
  }
})

console.log(`test:>`, schema3.safeParse('').error?.issues)
</script>

<style lang="scss" scoped></style>
