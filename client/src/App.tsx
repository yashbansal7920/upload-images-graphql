import React from "react";
import { createClient, dedupExchange, cacheExchange, Provider } from "urql";
import { multipartFetchExchange } from "@urql/exchange-multipart-fetch";
import Upload from "./Upload";

const client = createClient({
  url: "http://localhost:5000/graphql",
  exchanges: [dedupExchange, cacheExchange, multipartFetchExchange],
});

const App = () => {
  return (
    <Provider value={client}>
      <Upload />
    </Provider>
  );
};

export default App;
