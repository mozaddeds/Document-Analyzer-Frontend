"use client"

import React, { use } from 'react'
import Form from 'next/form'
import { SubmitHandler, useForm } from 'react-hook-form';

type FormData = {
  file: FileList; 
};

const FileInput = () => {

  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(data.file[0]);
  }

  return (
    <div>
      <Form action="onSubmit" onSubmit={handleSubmit(onSubmit)}>
        <div className='border-2 border-green-500 w-120 p-2 mt-5 rounded-2xl flex flex-row justify-evenly'>
          <label className='' htmlFor="file">Upload File:</label>
          <input className='bg-gray-700 text-white placeholder:text-gray-400 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-3'
          type="file"
          id="file"
          accept='.pdf'
          {...register("file", { required: true })}
          />
          <button type="submit">Submit</button>

        </div>
      </Form>
    </div>
  )
}

export default FileInput