import React, { ChangeEvent, useCallback } from "react";
import { gql, useQuery, useMutation } from "urql";

const singleUploadMutation = gql`
  mutation ($file: Upload!) {
    singleUpload(file: $file)
  }
`;

const multipleUploadMutation = gql`
  mutation ($file: [Upload!]!) {
    uploadFile(file: $file)
  }
`;

const Upload = () => {
  const [result, mutate] = useMutation(multipleUploadMutation);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      // const { target } = e;
      console.log(e.target.files);
      return e.target.validity.valid && mutate({ file: e.target.files });
    },
    [mutate]
  );

  console.log(result);

  return <input type="file" multiple required onChange={handleChange} />;
};

export default Upload;
