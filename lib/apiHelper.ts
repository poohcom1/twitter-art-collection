import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getMongoConnection } from "./mongodb";

interface RESTMethods {
  GET?: NextApiHandler;
  POST?: NextApiHandler;
  PUT?: NextApiHandler;
  DELETE?: NextApiHandler;
}

export function dbMethodHandler(methods: RESTMethods): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await getMongoConnection();

    const method = methods[req.method as keyof RESTMethods];

    if (method) {
      return method(req, res);
    } else {
      res.send(
        new Response("Method not implemented", {
          status: 501,
        })
      );
    }
  };
}
