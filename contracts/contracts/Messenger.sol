//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Wormhole/IWormhole.sol";

contract Messenger {
    IWormhole core_bridge; 
    uint32 nonce = 0;
    mapping(uint256 => string) all_messages;

    constructor(address core_bridge_address){
        core_bridge = IWormhole(core_bridge_address); //Core bridge of Current Chain
    }

    function sendMsg(uint256 ideas_id, string memory messages) public returns (uint64 sequence) {
        //Encoding all messages per ideas in bytes
        bytes memory str =  (abi.encode(ideas_id, messages));
        sequence = core_bridge.publishMessage(nonce, str, 1);
        nonce = nonce+1;
    }

   function sendMsgLOCAL(uint256 ideas_id, string memory messages) public returns (uint256) {
         all_messages[ideas_id] = messages;
         return ideas_id;
    }

    function receiveEncodedMsg(bytes memory encodedMsg) public {
        (IWormhole.VM memory vm, bool valid, string memory reason) = core_bridge.parseAndVerifyVM(encodedMsg);
        
        //1. Check Wormhole Guardian Signatures
        //  If the VM is NOT valid, will return the reason it's not valid
        //  If the VM IS valid, reason will be blank
        require(valid, reason);

        //Decoding all messages per ideas in bytes
        (uint256 ideas_id, string memory messages) = abi.decode(vm.payload, (uint256, string)); 

        //Storing all the messages into map
        all_messages[ideas_id] = messages;

    }

    function getCurrentMsges(uint256 ideas_id) public view returns (string memory){
        return all_messages[ideas_id];
    }
}
