import { model, IOperateParams } from "helux";
import { getVal, setVal } from "@helux/utils";

const replacedKeys: Record<string, boolean> = {};
export const createStore = () => {
  return model((api) => {
    console.log("createStore");
    const valuePath = ["fullName"];
    const stateCtx = api.sharex(
      {
        firstName: "zhange",
        lastName: "fisher",
        fullName: async () => { },
      },
      {
        onRead: (params: IOperateParams) => {
          const { fullKeyPath: valuePath, value } = params;
          const key = valuePath.join(".");
          if (typeof params.value !== "function" || replacedKeys[key]) return;

          replacedKeys[key] = true;
          const mutate = stateCtx.mutate({
            // 依赖是相于对根对象的
            deps: (draft: any) => {
              return [draft.firstName, draft.lastName];
            },
            fn: (draft, params) => {
              if (params.isFirstCall) {
                setVal(draft, valuePath, { value: "zhangfisher" });
              }
            },
            // { draft, setState, input, extraArgs }
            task: async (args: Record<string, any>) => {
              console.log("Run mutate task = ", args.desc);
            },
            immediate: true,
          });
          console.log('replace ', valuePath);
          params.replaceValue(getVal(stateCtx.state, valuePath));
        },
        desc: "fullName",
      }
    );
    return stateCtx;
  });
};
