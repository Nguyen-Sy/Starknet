import { useBlock, useContractRead, useContractWrite} from "@starknet-react/core";
import {CallData} from 'starknet'
import WalletBar from "./components/WalletBar";
import CONTRACT_ABI from "../contracts/abi.json";
import { useEffect } from "react";

function App() {
    const { data, isLoading, isError } = useBlock({
        refetchInterval: 3000,
    });

    // useContractRead only available with view functions in abi.
    const getBal = useContractRead({
        abi: CONTRACT_ABI,
        address: import.meta.env.VITE_CONTRACT_ADDRESS,
        functionName: "get_balance",
        args: [import.meta.env.VITE_ACCOUNT_ADDRESS],
    });
    const callData = new CallData(CONTRACT_ABI)

    // all callData of functions must be compiled frist
    // all arguments and their type can be found in abi.json
    // type felt252 = hex type with prefix 0x
    const depositCallData = callData.compile("deposit_token", {
      "tokenAddress": import.meta.env.VITE_USDT_ADDRESS,
      "_from": import.meta.env.VITE_ACCOUNT_ADDRESS,
      "amount": 10000,
      "callbackData": 0x1 // must be hex type with prefix 0x.
    })

    // useContractWrite for external functions: 
    // deposit_token, transfer_token, withdraw_token, pause, unpause
    // all functions and their callData can be found in abi.json 
    const {data: writeDataDeposit, write: writeDeposit} = useContractWrite({
      calls: {
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
        entrypoint: "deposit_token",
        calldata: depositCallData
      }
    })

    const {write: writePause} = useContractWrite({
      calls: {
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
        entrypoint: "pause",
        calldata: []
      }
    })

    const {write: writeUnpause} = useContractWrite({
      calls: {
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
        entrypoint: "unpause",
        calldata: []
      }
    })


    useEffect(() => {
      console.log(writeDataDeposit)
    }, [writeDataDeposit])
    const handleClickPause = async () => {
      await writePause()
    }
    const handleClickUnpause = async () => {
      await writeUnpause()
    }
    const handleClickDeposit = async () => {
      await writeDeposit()
    }
    
    return (
        <main>
            <p>
                Get started by editing&nbsp;
                <code>pages/index.tsx</code>
            </p>
            <div>
                {isLoading
                    ? "Loading..."
                    : isError
                    ? "Error while fetching the latest block hash"
                    : `Latest block hash: ${data?.block_hash}`}
            </div>
            <div>
                {getBal.isLoading
                    ? "Loading"
                    : getBal.isError
                    ? "Error while fetching the latest block hash"
                    : `Balance: ${getBal.data}`}
            </div>
            <button onClick={handleClickDeposit}>Deposit</button>
            <button onClick={handleClickPause}>Pause</button>
            <button onClick={handleClickUnpause}>Unpause</button>
            <WalletBar />
        </main>
    );
}

export default App;
