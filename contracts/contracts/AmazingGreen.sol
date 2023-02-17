// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Strings.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";

contract AmazingGreen  is ERC721EnumerableUpgradeable{

    struct dao_uri_struct {
        string dao_wallet;
        string dao_uri;
        string finished;
    }
    struct goal_uri_struct {
        uint256 dao_id;
        string goal_uri;
    }

    struct ideas_uri_struct {
        uint256 goal_id;
        string ideas_uri;
        uint256 donation;
    }
    struct smart_contract_uri_struct {
        uint256 smart_contract_id;
        uint256 ideas_id;
        string smart_contract_uri;
    }
    struct goal_ideas_votes_struct {
        uint256 goal_id;
        uint256 ideas_id;
        string wallet;
    }

    uint256 private _dao_ids;
    uint256 private _goal_ids;
    uint256 private _ideas_ids;
    uint256 private _smart_contract_ids;
    uint256 private _ideas_vote_ids;
    mapping(uint256 => dao_uri_struct) public _dao_uris;                            //_dao_ids              => (Dao)                    Dao Wallet + Dao URI   + Finished
    mapping(uint256 => goal_uri_struct) private _goal_uris;                         //_goal_ids             => (Goal)                   Dao ID + Goal URI
    mapping(uint256 => ideas_uri_struct) public _ideas_uris;                        //_ideas_ids            => (Ideas)                  Goal ID + Ideas URI
    mapping(uint256 => smart_contract_uri_struct) public _smart_contracts_uris;     //_smart_contract_ids   => (Ideas Smart contract)   Goal ID + Ideas URI
    mapping(uint256 => goal_ideas_votes_struct) public all_goal_ideas_votes;        //_ideas_vote_ids       => (Vote)                   Goal ID + Ideas ID + Wallet

    

    //Daos
    function create_dao(string memory _dao_wallet, string memory _dao_uri)
        public
        returns (uint256)
    {
        //Create Dao into _dao_uris
        _dao_uris[_dao_ids] = dao_uri_struct(_dao_wallet, _dao_uri, "False");
        _dao_ids++;

        return _dao_ids;
    }

    function set_dao(
        uint256 _dao_id,
        string memory _dao_wallet,
        string memory _dao_uri
    ) public {
        //Set Dao of wallet and uri
        _dao_uris[_dao_id].dao_wallet = _dao_wallet;
        _dao_uris[_dao_id].dao_uri = _dao_uri;
    }

    function get_all_daos() public view returns (string[] memory) {
        //Getting all doas
        string[] memory _StoreInfo = new string[](_dao_ids);
        for (uint256 i = 0; i < _dao_ids; i++) {
            _StoreInfo[i] = _dao_uris[i].dao_uri;
        }

        return _StoreInfo;
    }


    function dao_uri(uint256 _dao_id) public view returns (string memory) {
        //Getting one dao URI
        return _dao_uris[_dao_id].dao_uri;
    }

    //Goals
    function create_goal(string memory _goal_uri, uint256 _dao_id) public returns (uint256)
    {
        //Create goal into _goal_uris
        _goal_uris[_goal_ids] = goal_uri_struct(_dao_id, _goal_uri);
        _goal_ids++;

        return _goal_ids;
    }

    function set_goal(uint256 _goal_id, string memory _goal_uri) public {
        //Set goal uri
        _goal_uris[_goal_id].goal_uri = _goal_uri;
    }

    function get_all_goals() public view returns (string[] memory) {
        //Getting all goals
        string[] memory _StoreInfo = new string[](_goal_ids);
        for (uint256 i = 0; i < _goal_ids; i++) {
            _StoreInfo[i] = _goal_uris[i].goal_uri;
        }

        return _StoreInfo;
    }

    function get_all_goals_by_dao_id(uint256 _dao_id) public view returns (string[] memory) {
        //Getting all goals by dao id
        string[] memory _StoreInfo = new string[](_goal_ids);
        uint256 _store_id;
        for (uint256 i = 0; i < _goal_ids; i++) {
          if (_goal_uris[i].dao_id == _dao_id){
            _StoreInfo[_store_id] = _goal_uris[i].goal_uri;
            _store_id++;
          }
        }

        return _StoreInfo;
    }

    
    function get_goal_id_by_goal_uri(string memory _goal_uri) public view returns (uint256) {
        //Getting goal id by uri
        for (uint256 i = 0; i < _goal_ids; i++) {
          if (keccak256(bytes(_goal_uris[i].goal_uri)) == keccak256(bytes(_goal_uri))) return  i;
        }

        return 0;
    }

    function goal_uri(uint256 _goal_id) public view returns (string memory) {
        //Getting one goal URI
        return _goal_uris[_goal_id].goal_uri;
    }


    //Ideas
    function create_ideas(string memory _ideas_uri, uint256 _goal_id, string[] memory _smart_contracts) public returns (uint256)
    {
        //Create ideas into _ideas_uris
        _ideas_uris[_ideas_ids] = ideas_uri_struct(_goal_id, _ideas_uri,0);
        _ideas_ids++;

        for  (uint256 i = 0; i < _smart_contracts.length; i++) {
            create_ideas_smart_contract(_ideas_ids,_smart_contract_ids,_smart_contracts[i]);
            _smart_contract_ids++;
        }

        return _ideas_ids;
    }
    function create_ideas_smart_contract(uint256 _ideas_id,uint256 _smart_contract_id ,string memory _smart_contract) private {
        _smart_contracts_uris[_smart_contract_id] = smart_contract_uri_struct(_ideas_id,_smart_contract_id,_smart_contract);
        _mint(msg.sender, _smart_contract_id);
    }

    function set_ideas(uint256 _ideas_id, string memory _ideas_uri) public {
        //Set ideas uri
        _ideas_uris[_ideas_id].ideas_uri = _ideas_uri;
    }
    
    function add_donation(uint256 _ideas_id, uint256 _doantion) public {
        //Set ideas uri
        _ideas_uris[_ideas_id].donation += _doantion;
    }

    function get_all_ideas() public view returns (string[] memory) {
        //Getting all ideas
        string[] memory _StoreInfo = new string[](_ideas_ids);
        for (uint256 i = 0; i < _ideas_ids; i++) {
            _StoreInfo[i] = _ideas_uris[i].ideas_uri;
        }

        return _StoreInfo;
    }

    function get_all_ideas_by_goal_id(uint256 _goal_id) public view returns (string[] memory) {
        //Getting all ideas by goal id
        string[] memory _StoreInfo = new string[](_ideas_ids);        
        uint256 _store_id;
        for (uint256 i = 0; i < _ideas_ids; i++) {
          if (_ideas_uris[i].goal_id == _goal_id)
            _StoreInfo[_store_id] = _ideas_uris[i].ideas_uri;
            _store_id++;
        }

        return _StoreInfo;
    }

    
    function get_ideas_id_by_ideas_uri(string memory _ideas_uri) public view returns (uint256) {
        //Getting ideas id by uri
        for (uint256 i = 0; i < _ideas_ids; i++) {
          if (keccak256(bytes(_ideas_uris[i].ideas_uri)) == keccak256(bytes(_ideas_uri))) return  i;
        }

        return 0;
    }

    function get_goal_id_from_ideas_uri(string memory _ideas_uri) public view returns (uint256) {
     //Getting ideas id by uri
     for (uint256 i = 0; i < _ideas_ids; i++) {
       if (keccak256(bytes(_ideas_uris[i].ideas_uri)) == keccak256(bytes(_ideas_uri))) return  _ideas_uris[i].goal_id;
     }

     return 0;
    }


    function ideas_uri(uint256 _ideas_id) public view returns (string memory) {
        //Getting one ideas URI
        return _ideas_uris[_ideas_id].ideas_uri;
    }


    //Votes
    function create_goal_ideas_vote(uint256 _goal_id, uint256 _ideas_id,string memory _wallet) public returns (uint256)
    {
        //Create votes into all_goal_ideas_votes
        all_goal_ideas_votes[_ideas_vote_ids] = goal_ideas_votes_struct(_goal_id, _ideas_id,_wallet);
        _ideas_vote_ids++;

        return _ideas_vote_ids;
    }


   function get_ideas_votes_from_goal(uint256 _goal_id, uint256 _ideas_id) public view returns (string[] memory)
    {
        //gets all ideas votes from goal
        string[] memory _StoreInfo = new string[](_ideas_vote_ids);
        uint256 _store_id;
        for (uint256 i = 0; i < _ideas_vote_ids; i++) {
          if (all_goal_ideas_votes[i].goal_id == _goal_id && all_goal_ideas_votes[i].ideas_id == _ideas_id )
            _StoreInfo[_store_id] = all_goal_ideas_votes[i].wallet;
            _store_id++;
        }
        return _StoreInfo;
    }

    function reset_all() public {
      _dao_ids = 0;
      _goal_ids = 0;
      _ideas_ids = 0;
      _ideas_vote_ids = 0;
      for (uint256 i = 0; i < _dao_ids; i++)            delete _dao_uris[i];
      for (uint256 i = 0; i < _goal_ids; i++)           delete _goal_uris[i];
      for (uint256 i = 0; i < _ideas_ids; i++)          delete _ideas_uris[i];
      for (uint256 i = 0; i < _ideas_vote_ids; i++)     delete all_goal_ideas_votes[i];    

    }
}
