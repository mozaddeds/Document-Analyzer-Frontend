"use client"

import React, { use } from 'react'
import Form from 'next/form'
import { SubmitHandler, useForm } from 'react-hook-form';

type FormData = {
  file: FileList;
};

type FileUploadPayload = {
  fileName: string;
  fileSize: number;
  fileType: string;
  lastModified: number;
};

const FileInput = () => {

  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data.file[0]);
    const file = data.file[0];
    const payload: FileUploadPayload = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: file.lastModified,
    };
    console.log(payload);

    const formData = new FormData();
    formData.append('file', file);  // ← This sends the actual file bytes

    try {
      const response = await fetch('http://localhost:8000/analyzer', {
        method: 'POST',
        body: formData

      });

      const result = await response.json();
      console.log("Upload result: \n", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }

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