// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract HelloWorld {
    string public myString = "hello world";
}

contract ValueTypes {
    bool public b = true;
    uint public u = 123;
    int public i = -123;
    int public minInt = type(int).min;   
    int public maxInt = type(int).max;
    address public addr = 0xb794F5eA0ba39494cE839613fffBA74279579268;
    bytes32 public b32 = 0x626c756500000000000000000000000000000000000000000000000000000000;
}

contract FuncionIntro {
   function add(uint x, uint y) external pure returns (uint) {
       return x + y;
   } 
   function sub(uint x, uint y) external pure returns (uint) {
       return x - y;
   }
}

contract StateVariables {
    uint public myUnit = 123;

    function foo() external {
        uint notStateVariable = 456;
    }
}

contract LocalVariables {
    uint public i;
    bool public b;
    address public myAddress;

    function foo() external {
        uint x = 123;
        bool f = false;
        x += 456;
        f = true;

        i = 123;
        b = true;
        myAddress = address(1);
    }
}

contract GlobalVariables {
    function globalVars() external view returns (address, uint, uint){
        address sender = msg.sender;
        uint timestamp = block.timestamp;
        uint blockNum = block.number;
        return (sender, timestamp, blockNum);
    }
}

contract ViewAndPureFunction {
    uint public num;

    function viewFunc() external view returns (uint) {
        return num;
    }
    
    function pureFunc() external pure returns (uint) {
        return 1;
    }

    function addToNum(uint x) external view returns (uint) {
        return num + x;
    }
    
    function add(uint x, uint y) external pure returns (uint) {
        return x + y;
    }
}

contract Counter {
    uint public count;

    function inc() external {
        count += 1;
    }

    function dec() external {
        count -= 1;
    }
}

contract DefaultValues {
    bool public b; //false
    uint public u; // 0
    int public i; // 0
    address public a; // 0x0000000000000000000000000000000000000000
    bytes32 public b32; // 0x00000000000000000000000000000000000000000000000000000000
}

contract Constants {
    address public constant MY_ADDRESS = address(7);
    uint public constant MY_UINT = 123;
}

contract Var {
    address public MY_ADDRESS = address(7);
}

contract IfElse {
    function example(uint _x) external pure returns (uint) {
        if(_x < 10){
            return 1;
        } else if(_x < 20) {
            return 2;
        } else {
            return 3;
        }
    }

    function ternary(uint _x) external pure returns (uint) {
        // if(_x < 10){
        //     return 1;
        // }
        // return 2;
        return _x < 10 ? 1 : 2;
    }


}

contract ForAndWhileloops {
    function loops() external pure {
        for (uint i = 0; i < 10; i++){
            // code
            if( i == 3){
                continue;
            }
            //more code
            if (i == 5){
                break;
            }
        }
        uint j = 0;
        while (j < 10){
            //code
            j++;
        }
    }
    function sum(uint _n) external pure returns (uint) {
        uint s;
        for (uint i = 1; i <= _n; i++){
            s += i;
        }
        return s;
    }
}

contract Error {
    function testRequire(uint _i) public pure {
        require(_i <= 10, "i > 10");
        // code
    }

    function testRevert(uint _i) public pure {
        if(_i > 10){
           revert("i > 10"); 
        }
    }

    uint public num = 123;

    function testAssert() public view{
        assert(num == 123);
    }

    function foo(uint _i) public {
        num += 1;
        require(_i < 10);
    }

    error MyError(address caller, uint i);

    function testCustomError(uint _i) public view {
        if(_i > 10){
            revert MyError(msg.sender, _i);
        }
    }
}

contract FunctionModifier{
    bool public paused;
    uint public count;

    function setPause(bool _paused) external {
        paused = _paused;
    }

    modifier whenNotPaused() {
        require(!paused, "paused");
        _;
    }

    function inc() external whenNotPaused {
        count += 1;
    }

    function dec() external whenNotPaused {
        count -= 1;
    }

    modifier cap(uint _x) {
        require(_x < 100, "x >= 100");
        _;
    }

    function incBy(uint _x) external whenNotPaused cap(_x) {
        count += _x;
    }

    modifier sandwich() {
        // code here
        count += 10;
        _;
        // more code here
        count *= 2;
    }

    function foo() external sandwich {
        count += 1;
    }
}

contract Constructor {
    address public owner;
    uint public x;

    constructor(uint _x) {
        owner = msg.sender;
        x = _x;
    }
}

contract Ownable{
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function setOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "invalid address");
        owner = _newOwner;
    }

    function onlyOwnerCanCallThisFunc() external onlyOwner {
        // code
    }

    function anyOneCanCall() external{
        // code
    }
}

contract FunctionOutputs {
    function returnMany() public pure returns (uint, bool){
        return (1, true);
    }

    function named() public pure returns (uint x, bool b){
        return (1, true);
    }
    
    function assigned() public pure returns (uint x, bool b){
        x = 1;
        b = true;
    }

    function destructingAssigments() public pure {
        (uint x, bool b) = returnMany();
        (, bool _b) = returnMany();
    }
}

contract Array {
    uint[] public nums = [1, 2, 3];
    uint[3] public numsFixed = [4, 5, 6];

    function examples() external{
        nums.push(4);
        uint x = nums[1];
        nums[2] = 777;
        delete nums[1];
        nums.pop();
        uint len = nums.length;

        uint[] memory a = new uint[](5);
        a[1] = 123;
    }

    function returnArray() external view returns (uint[] memory) {
        return nums;
    }
}

contract ArrayShift {
    uint[] public arr;

    function example() public{
        arr = [1, 2, 3];
        delete arr[1];
    }

    function remove(uint _index) public {
        require(_index < arr.length, "index out of bound");

        for (uint i = _index; i < arr.length - 1; i++){
            arr[i] = arr[i + 1];
        }
        arr.pop();
    }

    function test() external{
        arr = [1, 2, 3, 4, 5];
        remove(2);
        assert(arr[0] == 1);
        assert(arr[1] == 2);
        assert(arr[2] == 4);
        assert(arr[3] == 5);
        assert(arr.length == 4);

        arr = [1];
        remove(0);
        
        assert(arr.length == 0);
    }
}

contract ArrayReplaceLast {
    uint[] public arr;

    function remove(uint _index) public{
        arr[_index] = arr[arr.length - 1];
        arr.pop();
    }

    function test() external{
        arr = [1, 2, 3, 4];

        remove(1);

        assert(arr.length == 3);
        assert(arr[0] == 1);
        assert(arr[1] == 4);
        assert(arr[2] == 3);

        remove(2);

        assert(arr.length == 2);
        assert(arr[0] == 1);
        assert(arr[1] == 4);
    }
}

contract Mapping {
    mapping(address => uint) public balances;
    mapping(address => mapping(address => bool)) public isFriend;

    function examples() external {
        balances[msg.sender] = 123;
        uint bal = balances[msg.sender];
        uint bal2 = balances[address(1)];

        balances[msg.sender] += 456;

        delete balances[msg.sender];

        isFriend[msg.sender][address(this)] = true;
    }

}

contract IterableMapping {
    mapping(address => uint) public balances;
    mapping(address => bool) public inserted;
    address[] public keys;

    function set(address _key, uint _val) external{
        balances[_key] = _val;

        if (!inserted[_key]) {
            inserted[_key] = true;
            keys.push(_key);
        }
    }

    function getSize() external view returns (uint) {
        return keys.length;
    }

    function first() external view returns (uint){
        return balances[keys[0]];
    }

    function last() external view returns (uint){
        return balances[keys[keys.length - 1]];
    }

    function get(uint _i) external view returns (uint){
        return balances[keys[_i]];
    }
}