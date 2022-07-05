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

contract Struct {
    struct Car {
        string model;
        uint year;
        address owner;
    }

    Car public car;
    Car[] public cars;
    mapping(address => Car[]) public carsByOwners;

    function examples() external{
        Car memory toyota = Car("Toyota", 1990, msg.sender);
        Car memory lambo = Car({year: 1980, model: "Lamborghini", owner: msg.sender});
        Car memory tesla;
        tesla.model = "Tesla";
        tesla.year = 2010;
        tesla.owner = msg.sender;

        cars.push(toyota);
        cars.push(lambo);
        cars.push(tesla);

        cars.push(Car("Ferrari", 2020, msg.sender));

        Car storage _car = cars[0];
        _car.year = 1999;
        delete _car.owner;

        delete cars[1];
    }
}

contract Enum {
    enum Status {
        None,
        Pending,
        Shipped,
        Completed,
        Rejected,
        Canceled
    }

    Status public status;

    struct Order {
        address buyer;
        Status status;
    }

    Order[] public orders;

    function get() view external returns (Status){
        return status;
    }

    function set(Status _status) external {
        status = _status;
    }

    function ship() external{
        status = Status.Shipped;
    }

    function reset() external {
        delete status;
    }
}

contract TestContract1 {
    address public owner = msg.sender;

    function setOwner(address _owner) public {
        require(msg.sender == owner, "not owner");
        owner = _owner;
    }
}

contract TestContract2 {
    address public owner = msg.sender;
    uint public value = msg.value;
    uint public x;
    uint public y;

    constructor(uint _x, uint _y) payable{
            x = _x;
            y = _y;
    }
}

contract Proxy {
    event Deploy(address);

    function deploy(bytes memory _code) external payable returns (address addr){
        assembly {
            addr := create(callvalue(), add(_code, 0x20), mload(_code))
        }
        require(addr != address(0), "deploy failed");
        emit Deploy(addr);
    }

    function execute(address _target, bytes memory _data) external payable{
        (bool success, ) = _target.call{value : msg.value}(_data);
        require(success, "failed");
    }
}
 
contract Helper{
    function getBytecode1() external pure returns (bytes memory){
        bytes memory bytecode = type(TestContract1).creationCode;
        return bytecode;
    }

    function getBytecode2(uint _x, uint _y) external pure returns (bytes memory){
        bytes memory bytecode = type(TestContract2).creationCode;
        return abi.encodePacked(bytecode, abi.encode(_x, _y));
    }

    function getCalldata(address _owner) external pure returns (bytes memory) {
        return abi.encodeWithSignature("setOwner(address)", _owner);
    }
}

contract DataLocations{
    struct MyStruct {
        uint foo;
        string text;
    }

    mapping(address => MyStruct) public myStructs;

    function examples(uint[] calldata y, string calldata s) external returns (uint[] memory){
        myStructs[msg.sender] = MyStruct({foo : 123, text : "bar"});

        MyStruct storage myStruct = myStructs[msg.sender];
        myStruct.text = "foo";
        MyStruct memory readOnly = myStructs[msg.sender];
        readOnly.foo = 456;    

        _internal(y);

        uint[] memory memArr = new uint[](3);
        memArr[0] = 234;
        return memArr;
    }

    function _internal(uint[] calldata y) private {
        uint x= y[0];
    }
}

contract SimpleStorage{
    string public text;

    function set(string calldata _text) external {
        text = _text;
    }

    function get() external view returns (string memory){
        return text;
    }
}

contract TodoList{
    struct Todo {
        string text;
        bool completed;
    }

    Todo[] public todos;

    function create(string calldata _text) external {
        todos.push(Todo({text: _text, completed : false}));
    }

    function updateText(uint _index, string calldata _text) external {
        todos[_index].text = _text;

        // Todo storage todo = todos[_index];
        // todo.text = _text;
    }

    function get(uint _index) external view returns(string memory, bool){
        Todo memory todo = todos[_index];
        return (todo.text, todo.completed);
    }

    function toggleCOmpleted(uint _index) external{
        todos[_index].completed = !todos[_index].completed;
    }
}

contract Event {
    event Log(string message, uint val);
    event IndexedLog(address indexed sender, uint val);
    function example() external {
        emit Log("foo", 1234);
        emit IndexedLog(msg.sender, 789);
    }

    event Message(address indexed _from, address indexed _to, string message);

    function sendMessage(address _to, string calldata message) external{
            emit Message(msg.sender, _to, message);
    }
}

contract A {
    function foo() public pure virtual returns (string memory){
        return "A";
    }

    function bar() public pure virtual returns (string memory){
        return "A";
    }

    function baz() public pure returns (string memory){
        return "A";
    }
}

contract B is A {
    function foo() public pure override returns (string memory){
        return "B";
    }

    function bar() public pure virtual override returns (string memory){
        return "B";
    }
}
contract C is B {
    function bar() public pure override returns (string memory){
        return "C";
    }  
}

contract X{
    function foo() public pure virtual returns (string memory){
        return "X";
    }

    function bar() public pure virtual returns (string memory){
        return "X";
    }

    function x() public pure returns (string memory){
        return "X";
    }
}

contract Y is X {
    function foo() public pure virtual override returns (string memory){
        return "Y";
    }

    function bar() public pure virtual override returns (string memory){
        return "Y";
    }

    function y() public pure returns (string memory){
        return "Y";
    }    
}

contract Z is X, Y {
        function foo() public pure override(X, Y) returns (string memory){
        return "Z";
    }

    function bar() public pure override(Y, X) returns (string memory){
        return "Z";
    }
}

contract S {
    string public name;

    constructor(string memory _name) {
        name = _name;
    }
}

contract T {
    string public text;

    constructor(string memory _text) {
        text = _text;
    }
}

contract U is S("s"), T("t") {

}

contract V is S, T {
    constructor(string memory _name, string memory _text) S(_name) T(_text) {}
}

contract VV is S("s"), T {
    constructor(string memory _text) T(_text) {}
}

contract V0 is S, T {
    constructor(string memory _name, string memory _text)  T(_text) S(_name) {}
}

contract V1 is S, T {
    constructor(string memory _name, string memory _text)  S(_name) T(_text) {}
}

contract V2 is T, S {
    constructor(string memory _name, string memory _text)  T(_text) S(_name) {}
}

contract V3 is T, S {
    constructor(string memory _name, string memory _text)  S(_name) T(_text) {}
}

contract E {
    event Log(string message);

    function foo() public virtual {
        emit Log("E.foo");
    }
    function bar() public virtual {
        emit Log("E.bar");
    }
}

contract F is E {
    function foo() public virtual override{
        E.foo();
    }

    function bar() public virtual override{
        emit Log("F.bar");
        super.bar();
    }
}

contract G is E{
    function foo() public virtual override{
        emit Log("G.foo");
        E.foo();
    }
    function bar() public virtual override{
        emit Log("G.bar");
        super.bar();
    }
}

contract H is F, G {
    function foo() public override(F, G){
        F.foo();
    }

    function bar() public override(F, G){
        super.bar();
    }
}

contract VisibilityBase{
    uint private x = 0;
    uint internal y = 1;
    uint public z = 2;

    function privateFunc() private pure returns (uint) {

    }

    function internalFunc() internal pure returns (uint) {

    }
    
    function publicFunc() public pure returns (uint) {

    }
    
    function externalFunc() external pure returns (uint) {

    }

    function examples() external view{
        x + y + z;
        privateFunc();
        internalFunc();
        publicFunc();

        // this.externalFunc();
    }
}

contract VisibilityChild is VisibilityBase{
    function examples2() external view{
        y + z;
        
        internalFunc();
        publicFunc();
    }
}

contract Immutable{
    address public immutable owner;

    constructor(){
        owner = msg.sender;
    }

    uint public x;
    function foo() external {
        require(msg.sender == owner);
        x += 1;
    }
}

contract Payable {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    function deposit() external payable {}

    function getBalance() external view returns (uint){
        return address(this).balance;
    }
}

contract Fallback {
    event Log(string func, address sender, uint value, bytes data);

    fallback() external payable {
        emit Log("fallback", msg.sender, msg.value, msg.data);
    }

    receive() external payable {
        emit Log("receive", msg.sender, msg.value, "");
    }
}

contract SendEther{
    constructor() payable {}

    receive() external payable {}

    function sendViaTransfer(address payable _to) external payable {
        _to.transfer(123);
    }

    function sendViaSend(address payable _to) external payable {
        bool sent = _to.send(123);
        require(sent, "send failed");
    }

    function sendViaCall(address payable _to) external payable {
        (bool success,) =  _to.call{value: 123}("");
        require(success, "call failed");
    }
}

contract EthReceiver {
    event Log(uint amount, uint gas);

    receive() external payable {
        emit Log(msg.value, gasleft());
    }
}

contract EtherWallet {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    receive() external payable {}

    function withdraw(uint _amount) external {
        require(msg.sender == owner, "caller is not owner");
        payable(msg.sender).transfer(_amount);
        
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
}

contract CallTestContract{
    function setX(TestContract _test, uint _x) external {
        _test.setX(_x);
    }

    function getX(address _test) external view returns (uint x) {
        x = TestContract(_test).getX();
    }

    function setXandSendEther(address _test, uint _x) external payable {
        TestContract(_test).setXandReceiveEther{value : msg.value}(_x);
    }

    function getXandValue(address _test) external view returns (uint x, uint value) {
        (x, value) = TestContract(_test).getXandValue();
    }
}

contract TestContract{
    uint public x;
    uint public value = 123;

    function setX(uint _x) external {
        x = _x;
    }

    function getX() external view returns (uint) {
        return x;
    }


    function setXandReceiveEther(uint _x) external payable {
        x = _x;
        value = msg.value;
    }

    function getXandValue() external view returns (uint, uint){
        return (x, value);
    }
}

contract Counter1 {
    uint public count;

    function inc() external {
        count += 1;
    }

    function dec() external {
        count -= 1;
    }
}

interface ICounter{
    function count() external view returns (uint);
    function inc() external;

}

contract CallInterface {
    function examples(address _counter) external {
        ICounter(_counter).inc();
        ICounter(_counter).count();
    }
}

contract TestCall {
    string public message;
    uint public x;

    event Log(string message);

    fallback() external payable {
        emit Log("fallback was called");
    }

    function foo(string memory _message, uint _x) external payable returns (bool, uint) {
        message = _message;
        x = _x;
        return (true, 999);
    }
}

contract Call{
    bytes public data;

    function callFoo(address _test) external payable{
        (bool success, bytes memory _data) = _test.call{value : 111, gas : 5000}(abi.encodeWithSignature(
            "foo(string,uint256)", "call foo", 123
        ));
        require(success, "call failed");
        data = _data;
    }

    function callDoesNotExist(address _test) external {
        (bool success, ) = _test.call(abi.encodeWithSignature("doesNotExist()"));
        require(success, "call failed");
    }
}

contract TestDelegateCall {
    uint public num;
    address public sender;
    uint public value;

    function setVars(uint _num) external payable {
        num = 2 * _num;
        sender = msg.sender;
        value - msg.value;
    } 
}

contract DelegateCall {
    uint public num;
    address public sender;
    uint public value;
   
    function setVars(address _test, uint _num) external payable {
        // _test.delegateCall(abi.encodeWithSignature("setVar(uint256", _num));

        (bool success, bytes memory data) = _test.delegatecall(
            abi.encodeWithSelector(TestDelegateCall.setVars.selector, _num)
        );
        require(success, "delegate call failed");
    }
}

contract Account{
    address public bank;
    address public owner;

    constructor(address _owner) payable {
        bank = msg.sender;
        owner = _owner;
    }
}

contract AccountFactory {
    Account[] public accounts;

    function createAccount(address _owner) external payable{
        Account account = new Account{value : 111}(_owner);
        accounts.push(account);
    }
}

library Math {
    function max(uint x, uint y) internal pure returns (uint) {
        return x >= y ? x : y;
    }
}

contract Test{
    function testMax(uint x, uint y) external pure returns (uint) {
        return Math.max(x, y);
    }
}

library ArrayLib{
    function find(uint[] storage arr, uint x) internal view returns (uint){
        for(uint i = 0; i < arr.length; i++){
            if(arr[i] == x){
                return i;
            }
        }
        revert("not found");
    }
}

contract TestArray {
    using ArrayLib for uint[];
    uint[] public arr = [3, 2, 1];

    function testFind() external view returns (uint i){
            i = arr.find(2);
    }
}

contract HashFunc {
    function hash(string memory text, uint num, address addr) external pure returns (bytes32){
        return keccak256(abi.encodePacked(text, num, addr));
    }

    function encode(string memory text0, string memory text1) external pure returns (bytes memory){
        return abi.encode(text0, text1);
    }

    function encodePacked(string memory text0, string memory text1) external pure returns (bytes memory){
        return abi.encodePacked(text0, text1);
    }

    function collision(string memory text0, uint x,string memory text1) external pure returns (bytes32){
        return keccak256(abi.encodePacked(text0, x, text1));
    }
}

contract VerifySig{
    function verify(address _signer, string memory _message, bytes memory _sig)
        external pure returns (bool)
    {
        bytes32 messageHash = getMessageHash(_message);
        bytes32 ethSignedMessageHash = getEthSignedMessageHas(messageHash);

        return recover(ethSignedMessageHash, _sig) == _signer;
    }

    function getMessageHash(string memory _message) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }

    function getEthSignedMessageHas(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            "\x19Etherium Signed Message:\n32",
            _messageHash
            ));
    }

    function recover(bytes32 _ethSignedMessageHash, bytes memory _sig) 
        public pure returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = _split(_sig);
        ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function _split(bytes memory _sig) internal pure 
        returns (bytes32 r, bytes32 s, uint8 v)
    {
           require(_sig.length == 65, "invalid signature length");

           assembly {
               r := mload(add(_sig, 32))
               s := mload(add(_sig, 64))
               v := byte(0, mload(add(_sig, 96)))
           }
    }
}

contract AccessControl {
    event GrantRole(bytes32 indexed role, address indexed account);
    event RevokeRole(bytes32 indexed role, address indexed account);
    mapping(bytes32 => mapping(address => bool)) public roles;

    bytes32 private constant ADMIN = keccak256(abi.encodePacked("ADMIN"));
    bytes32 private constant USER = keccak256(abi.encodePacked("USER"));

    modifier onlyRole(bytes32 _role) {
        require(roles[_role][msg.sender], "not authorized");
        _;
    }

    constructor() {
        _grantRole(ADMIN, msg.sender);
    }

    function _grantRole(bytes32 _role, address _account) internal {
        roles[_role][_account] = true;
        emit GrantRole(_role, _account);
    }

    function grantRole(bytes32 _role, address _account) external onlyRole(ADMIN){
        _grantRole(_role, _account);
    }

    function revokeRole(bytes32 _role, address _account) external onlyRole(ADMIN){
        roles[_role][_account] = false;
        emit RevokeRole(_role, _account);
    }   
}

contract Kill {
    constructor() payable {}

    function kill () external{
        selfdestruct(payable(msg.sender));
    }

    function testCall() external pure returns (uint) {
        return 123;
    }
}

contract KillHelper {
    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    function kill(Kill _kill) external {
        _kill.kill();
    }
}

contract PiggyBank{
    event Deposit(uint amout);
    event Withdraw(uint amount);
    
    address public owner = msg.sender;

    receive() external payable{
        emit Deposit(msg.value);
    }

    function withdraw() external {
        require(msg.sender == owner, "not owner");
        emit Withdraw(address(this).balance);
        selfdestruct(payable(msg.sender));
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint);

    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed _to, uint amount);
    event Approval(address indexed owner, address indexed spender, uint amount);
}

contract ERC20_t is IERC20 {
    uint public override totalSupply;
    mapping(address => uint) public override balanceOf;
    mapping(address => mapping(address => uint)) public override allowance;
    string public name = "Test";
    string public symbol = "TEST";
    uint public decimals = 18;


    function transfer(address recipient, uint amount) external override returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) external override returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external override returns (bool) {
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(uint amount) external {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

        function burn(uint amount) external {
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}

contract MultiSigWallet{
    event Deposit(address indexed sender, uint amount);
    event Submit(uint indexed txId);
    event Approve(address indexed owner, uint indexed txId);
    event Revoke(address indexed owner, uint indexed tctId);
    event Execute(uint indexed txId);

    struct Transaction{
        address to;
        uint value;
        bytes data;
        bool executed;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public required;

    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public approved;

    modifier onlyOwner(){
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier txExists(uint _txId) {
        require(_txId < transactions.length, "tx does not exist");
        _;
    }

    modifier notApproved(uint _txId){
        require(!approved[_txId][msg.sender], "tx already approved");
        _;
    }

    modifier notExecuted (uint _txId) {
        require(!transactions[_txId].executed, "tx already executed");
        _;
    }    

    constructor (address[] memory _owners, uint _required) {
        require(_owners.length > 0, "owners required");
        require(
            _required > 0&& _required <= owners.length,
            "invalid required number of owners"
        );

        for(uint i;i < _owners.length; i++){
            address owner = _owners[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner is not unique");
            isOwner[owner] = true;
            owners.push(owner);
            required = _required;
        }
    }

    receive() external payable{
        emit Deposit(msg.sender, msg.value);
    }

    function submit(address _to, uint _value, bytes calldata _data) 
        external onlyOwner
    {
        transactions.push(Transaction({
            to : _to,
            value : _value,
            data : _data,
            executed : false
        }));
        emit Submit(transactions.length - 1);
    }

    function approve(uint _txId) external 
        onlyOwner txExists(_txId) notApproved(_txId) notExecuted(_txId)
    {
        approved[_txId][msg.sender] = true;
        emit Approve(msg.sender, _txId);
    }

    function _getApprovalCount(uint _txId) private view returns (uint count) {
        for(uint i; i < owners.length; i++){
            if(approved[_txId][owners[i]]){
                count += 1;
            }
        }
    }

    function execute(uint _txId) external txExists(_txId) notExecuted(_txId)  {
        require(_getApprovalCount(_txId) >= required, "approvals < required");
        Transaction storage transaction = transactions[_txId];

        transaction.executed = true;
        (bool success, ) = transaction.to.call{value : transaction.value}(
            transaction.data
        );
        require(success, "call failed");

        emit Execute(_txId);
    }

    function revoke(uint _txId)
        external onlyOwner txExists(_txId) notExecuted(_txId)
    {
        require(approved[_txId][msg.sender], "tx not aproved");
        approved[_txId][msg.sender] = false;
        emit Revoke(msg.sender, _txId);
    }
}

contract FunctionSlector {
    function getSelector(string calldata _func) external pure returns (bytes4){
        return bytes4(keccak256(bytes(_func)));
    }
}

contract Receiver {
    event Log(bytes data);

    function transfer(address _to, uint _amount) external {
            emit Log(msg.data);
    }
}

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint _nftId
    ) external;
}

contract DutchAuction{
    uint private constant DURATION = 7 days;

    IERC721 public immutable nft;
    uint public immutable nftId;

    address payable public immutable seller;
    uint public immutable startingPrice;
    uint public immutable startAt;
    uint public immutable expiresAt;
    uint public immutable discountRate;

    constructor(
        uint _startingPrice,
        uint _discountRate,
        address _nft,
        uint _nftId
    ) {
        seller = payable(msg.sender);
        startingPrice = _startingPrice;
        discountRate = _discountRate;
        startAt = block.timestamp;
        expiresAt = block.timestamp + DURATION;
        require(
            _startingPrice >= _discountRate * DURATION,
            "starting price < discount"
        );
        nft = IERC721(_nft);
        nftId = _nftId;
    }

    function getPrice() public view returns (uint) {
        uint timeElapsed = block.timestamp - startAt;
        uint discount = discountRate * timeElapsed;
        return startingPrice - discount;
    }

    function buy() external payable{
        require(block.timestamp < expiresAt, "auction expired");

        uint price = getPrice();
        require(msg.value >= price, "ETH < price");

        nft.transferFrom(seller, msg.sender, nftId);
        uint refund = msg.value - price;
        if(refund > 0){
            payable(msg.sender).transfer(refund);
        }
        selfdestruct(seller);
    }
}

contract EnglishAuction{
    event Start();
    event Bid(address indexed sender, uint amount);
    event Withdraw(address indexed bidder, uint amount);
    event End(address indexed highestBidder, uint amount);

    IERC721 public immutable nft;
    uint public immutable nftId;
    address payable public immutable seller;
    uint32 public endAt;
    bool public started;
    bool public ended;
    address public highestBidder;
    uint public highestBid;
    mapping(address => uint) public bids;

    constructor(
        address _nft,
        uint _nftId,
        uint _startingBid
    ){
        nft = IERC721(_nft);
        nftId = _nftId;
        seller = payable(msg.sender);
        highestBid = _startingBid;
    }

    function start() external{
        require(msg.sender == seller, "not seller");
        require(!started, "auction already started");
        started = true;
        endAt = uint32(block.timestamp + 60);
        nft.transferFrom(seller, address(this), nftId);
        emit Start();
    }

    function bid() external payable {
        require(started,"not started");
        require(block.timestamp < endAt, "ended");
        require(msg.value > highestBid, "value < highest bid");
        if(highestBidder != address(0)){
            bids[highestBidder] += highestBid;
        }
        highestBid = msg.value;
        highestBidder = msg.sender;

        emit Bid(msg.sender, msg.value);
    }

    function withdraw() external{
        uint bal = bids[msg.sender];
        bids[msg.sender] = 0;
        payable(msg.sender).transfer(bal);
        emit Withdraw(msg.sender, bal);
    }

    function end() external {
        require(started, "not started");
        require(!ended, "already ended");
        require(block.timestamp >= endAt, "not ended");

        ended = true;
        if(highestBidder != address(0)){
            nft.transferFrom(address(this), highestBidder, nftId);
            seller.transfer(highestBid);
        } else {
            nft.transferFrom(address(this), seller, nftId);
        }

        emit End(highestBidder, highestBid);
    }
}

contract CrowdFund {
    event Launch(
        uint id,
        address indexed creator,
        uint goal,
        uint32 startAt,
        uint32 endAt
    );
    event Cancel(uint id);
    event Pledge(uint indexed id, address indexed caller, uint amount);
    event Unpledge(uint indexed id, address indexed caller, uint amount);
    event Claim(uint id);
    event Refund(uint indexed id,address indexed caller, uint amount);
    uint public count;
    struct Campaign{
        address creator;
        uint goal;
        uint pledged;
        uint32 startAt;
        uint32 endAt;
        bool claimed;

    }

    IERC20 public immutable token;
    mapping(uint => Campaign) public campaigns;
    mapping(uint => mapping(address => uint)) public pledgedAmount;

    constructor(address _token){
        token = IERC20(_token);
    }

    function launch(
        uint _goal,
        uint32 _startAt,
        uint32 _endAt
    ) external {
        require(_startAt >= block.timestamp, "start at < now");
        require(_endAt >= _startAt, "end at < start at");
        require(_endAt <= block.timestamp + 90 days, "end at > max duration");

        count += 1;
        campaigns[count] = Campaign({
            creator : msg.sender,
            goal : _goal,
            pledged : 0,
            startAt : _startAt,
            endAt : _endAt,
            claimed : false
        });

        emit Launch(count, msg.sender, _goal, _startAt, _endAt);
    }

    function cancel (uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(msg.sender == campaign.creator, "not creator");
        require(block.timestamp < campaign.startAt, "already started");
        delete campaigns[_id];
        emit Cancel(_id);
    }

    function pledge(uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.startAt, "not started");
        require(block.timestamp <= campaign.endAt, "already ended");

        campaign.pledged += _amount;
        pledgedAmount[_id][msg.sender] += _amount;
        token.transferFrom(msg.sender, address(this), _amount);

        emit Pledge(_id, msg.sender, _amount);
    }

    function unpledge(uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp <= campaign.endAt, "already ended");

        campaign.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;
        token.transfer(msg.sender, _amount);

        emit Unpledge(_id, msg.sender, _amount);
    }

    function claim(uint _id) external{
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.creator, "not creator");
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged >= campaign.goal, "pledged < goal");
        require(!campaign.claimed, "claimed ");

        campaign.claimed = true;
        token.transfer(msg.sender, campaign.pledged);

        emit Claim(_id);
    }

    function refund (uint _id) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged < campaign.goal, "pledged >= goal");

        uint bal = pledgedAmount[_id][msg.sender];
        pledgedAmount[_id][msg.sender] = 0;
        token.transfer(msg.sender, bal);

        emit Refund(_id, msg.sender, bal);
    }
}

contract DeployWithCreate2{
    address public owner;
    constructor (address _owner){
        owner = _owner;
    }
}

contract Create2Farctory{
    event Deploy(address addr);

    function deploy(uint _salt) external {
        DeployWithCreate2 _contract = new DeployWithCreate2{
            salt: bytes32(_salt)
        }(msg.sender);
        emit Deploy(address(_contract));
    }

    function getAddress(bytes memory bytecode, uint _salt)
        public view returns (address)
    {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), _salt, keccak256(bytecode)));
        return address(uint160(uint(hash)));
    }

    function getByteCode(address _owner) public pure returns (bytes memory){
        bytes memory bytecode = type(DeployWithCreate2).creationCode;
        return abi.encodePacked(bytecode, abi.encode(_owner));
    }
}

contract TestMultiCall{
    function func1() external view returns (uint, uint) {
        return (1, block.timestamp);
    }

    function func2() external view returns (uint, uint) {
        return (2, block.timestamp);
    }

    function getData1() external pure returns(bytes memory){
        return abi.encodeWithSelector(this.func1.selector);
    }

        function getData2() external pure returns(bytes memory){
        return abi.encodeWithSelector(this.func2.selector);
    }

}

contract MultiCal{
    function multiCall(address[] calldata targets, bytes[] calldata data)
        external view returns (bytes[] memory)
    {
       require(targets.length == data.length, "targets length != data length");
       bytes[] memory results = new bytes[](data.length);

        for(uint i; i < targets.length; i++){
            (bool success, bytes memory result) = targets[i].staticcall(data[i]);
            require(success, "call failed");
            results[i] = result;
        }

       return results;
    }
}

contract MultiDelegatecall{
    error DelegatecallFailed();
    function multiDelegatecall(bytes[] calldata data)
        external payable returns (bytes[] memory results)
    {
        results = new bytes[](data.length);

        for (uint i; i < data.length; i++){
            (bool ok, bytes memory res) = address(this).delegatecall(data[i]);
            if(!ok){
                revert DelegatecallFailed();
            }
            results[i] = res;
        }
    }
}

contract TestMultiDelegatecall is MultiDelegatecall{
    event Log(address caller, string func, uint i);

    function func1(uint x, uint y) external {
        emit Log(msg.sender, "func1", x + y);
    }

    function func2() external returns (uint){
        emit Log(msg.sender, "func2", 2);
        return 111;
    }

    mapping(address => uint) public balanceOf;

    function mint() external payable {
        balanceOf[msg.sender] += msg.value;
    }
}

contract MultiDelegatecallHelper{
    function getFunc1Data(uint x, uint y) external pure returns (bytes memory) {
        return abi.encodeWithSelector(TestMultiDelegatecall.func1.selector, x ,y);
    }
    function getFunc2Data() external pure returns (bytes memory) {
        return abi.encodeWithSelector(TestMultiDelegatecall.func2.selector);
    }
    
    function getMintData() external pure returns (bytes memory) {
        return abi.encodeWithSelector(TestMultiDelegatecall.mint.selector);
    }
}

contract AbiDecode {
    struct MyStruct{
        string name;
        uint[2] nums;
    }

    function encode(
        uint x,
        address addr,
        uint[] calldata arr,
        MyStruct calldata myStruct
    ) external pure returns (bytes memory) {
        return abi.encode(x, addr, arr, myStruct);
    }
    function decode(bytes calldata data) external pure returns (
        uint x,
        address addr,
        uint[] memory arr,
        MyStruct memory myStruct
        ) 
    {
        (x, addr, arr, myStruct) = abi.decode(data, (uint, address, uint[], MyStruct));
    }
}

contract GasGolf{
    uint public total;

    function sumIfEvenAndLessThan99(uint[] calldata nums) external {
        uint _total = total;
        uint length = nums.length; 
        for(uint i = 0; i < length; ++i){
            uint num = nums[i];
            if( num %2 == 0 && num < 99){
                _total += nums[i];
            }
        }
        total = _total;
    }

}

contract TimeLock {
    error NotOwnerError();
    error AlreadyQueuedError(bytes32 txId);
    error TimeStampNotInRangeError(uint blockTimestamp, uint timestamp);
    error NotQueuedError(bytes32 txId);
    error TimestampNotPassedError(uint blockTimestamp, uint timestamp);
    error TimestampExpiredError(uint blockTimestamp, uint timestamp);
    error TxFailedError();

    event Queue(
        bytes32 indexed txId,
        address indexed target,
        uint value,
        string func,
        bytes data,
        uint timestamp
    );
    event Execute(
        bytes32 indexed txId,
        address indexed target,
        uint value,
        string func,
        bytes data,
        uint timestamp
    );
    event Cancel(bytes32 indexed txId);
    uint public constant MIN_DELAY = 10;
    uint public constant MAX_DELAY = 1000;
    uint public constant GRACE_PERIOD = 1000;

    address public owner;
    mapping(bytes32 => bool) queued;
    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if(msg.sender != owner){
            revert NotOwnerError();
        }
        _;
    }

    receive() external payable {}

    function getTxId(
         address _target,
        uint _value,
        string calldata _func,
        bytes calldata _data,
        uint _timestamp
    ) public pure returns (bytes32 txId) {
        return keccak256(
            abi.encode(_target, _value, _func, _data, _timestamp)
        );
    }

    function queue(
        address _target,
        uint _value,
        string calldata _func,
        bytes calldata _data,
        uint _timestamp
    ) external onlyOwner {
        bytes32 txId = getTxId(_target, _value, _func, _data, _timestamp);
        if(queued[txId]){
            revert AlreadyQueuedError(txId);
        }
        if(
            _timestamp < block.timestamp + MIN_DELAY ||
            _timestamp > block.timestamp + MAX_DELAY
        ){
            revert TimeStampNotInRangeError(block.timestamp, _timestamp);
        }

        queued[txId] = true;

        emit Queue(
            txId, _target, _value, _func, _data, _timestamp
        );
    }
    function execute(
        address _target,
        uint _value,
        string calldata _func,
        bytes calldata _data,
        uint _timestamp   
    ) external payable onlyOwner returns (bytes memory){
        bytes32 txId = getTxId(_target, _value, _func, _data, _timestamp);
        if(!queued[txId]){
            revert NotQueuedError(txId);
        }
        if(block.timestamp  < _timestamp ){
            revert TimestampNotPassedError(block.timestamp, _timestamp);
        }
        if(block.timestamp  > _timestamp + GRACE_PERIOD){
            revert TimestampExpiredError(block.timestamp, _timestamp + GRACE_PERIOD);
        }

        queued[txId] = false;
        bytes memory data;
        if(bytes(_func).length > 0){
            data = abi.encodePacked(
                bytes4(keccak256(bytes(_func))), _data
            );
        } else {
            data = _data;
        }
        (bool ok, bytes memory res) = _target.call{value : _value}(data);
        if(!ok){
            revert TxFailedError();
        }

        emit Execute(txId, _target, _value, _func, _data, _timestamp);

        return res;
    }

    function cancel(bytes32 _txId) external onlyOwner {
        if(!queued[_txId]){
            revert NotQueuedError(_txId);
        }
        queued[_txId] = false;

        emit Cancel(_txId);
    }
}

contract TetTimeLock{
    address public timeLock;

    constructor(address _timeLock){
        timeLock = _timeLock;
    }

    function test() external {
        require(msg.sender == timeLock);
    }
}

import "@rari-capital/solmate/src/tokens/ERC20.sol";

contract WETH is ERC20 {
    event Deposit(address indexed account, uint amount);
    event Withdraw(address indexed account, uint amount);

    constructor () ERC20("Wrapped Ether", "WETH", 18) {}

    fallback() external payable{
        deposit();
    }

    function deposit() public payable {
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint _amount) external {
        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(_amount);
        emit Withdraw(msg.sender, _amount);
    }


}

contract Vault {
    IERC20 public immutable token;

    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function _mint(address _to, uint _amount) private {
        totalSupply += _amount;
        balanceOf[_to] += _amount;
    }

    function _burn(address _from, uint _amount) private {
        totalSupply -= _amount;
        balanceOf[_from] -= _amount;
    }

    function deposit(uint _amount) external {
        uint shares;
        if(totalSupply == 0){
            shares = _amount;
        } else {
            shares = (_amount * totalSupply) / token.balanceOf(address(this));
        }

        _mint(msg.sender, shares);
        token.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint _shares) external {
        uint amount = (_shares * token.balanceOf(address(this))) / totalSupply;
        _burn(msg.sender, _shares);
        token.transfer(msg.sender, amount);
    }
}


contract CSAMM {
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    uint public reserve0;
    uint public reserve1;

    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    constructor(address _token0, address _token1) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    function _mint(address _to, uint _amount) private {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
    }

    function _burn(address _from, uint _amount) private {
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
    }

    function _update(uint _res0, uint _res1) private {
        reserve0 = _res0;
        reserve1 = _res1;
    }

    function swap(address _tokenIn, uint _amountIn) external returns (uint amountOut) {
        require(
            _tokenIn == address(token0) || _tokenIn == address(token1),
            "invalid token"
        );

        bool isToken0 = _tokenIn == address(token0);

        (IERC20 tokenIn, IERC20 tokenOut, uint resIn, uint resOut) = isToken0
            ? (token0, token1, reserve0, reserve1)
            : (token1, token0, reserve1, reserve0);

        tokenIn.transferFrom(msg.sender, address(this), _amountIn);
        uint amountIn = tokenIn.balanceOf(address(this)) - resIn;

        amountOut = (amountIn * 997) / 1000;

        (uint res0, uint res1) = isToken0
            ? (resIn + amountIn, resOut - amountOut)
            : (resOut - amountOut, resIn + amountIn);

        _update(res0, res1);
        tokenOut.transfer(msg.sender, amountOut);
    }

    function addLiquidity(uint _amount0, uint _amount1) external returns (uint shares) {
        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), _amount1);

        uint bal0 = token0.balanceOf(address(this));
        uint bal1 = token1.balanceOf(address(this));

        uint d0 = bal0 - reserve0;
        uint d1 = bal1 - reserve1;
        if (totalSupply > 0) {
            shares = ((d0 + d1) * totalSupply) / (reserve0 + reserve1);
        } else {
            shares = d0 + d1;
        }

        require(shares > 0, "shares = 0");
        _mint(msg.sender, shares);

        _update(bal0, bal1);
    }

    function removeLiquidity(uint _shares) external returns (uint d0, uint d1) {
        d0 = (reserve0 * _shares) / totalSupply;
        d1 = (reserve1 * _shares) / totalSupply;

        _burn(msg.sender, _shares);
        _update(reserve0 - d0, reserve1 - d1);

        if (d0 > 0) {
            token0.transfer(msg.sender, d0);
        }
        if (d1 > 0) {
            token1.transfer(msg.sender, d1);
        }
    }
}

contract CPAMM {
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    uint public reserve0;
    uint public reserve1;

    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    constructor(address _token0, address _token1) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    function _mint(address _to, uint _amount) private {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
    }

    function _burn(address _from, uint _amount) private {
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
    }

    function _update(uint _reserve0, uint _reserve1) private {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
    }

    function swap(address _tokenIn, uint _amountIn) external returns (uint amountOut) {
        require(
            _tokenIn == address(token0) || _tokenIn == address(token1),
            "invalid token"
        );
        require(_amountIn > 0, "amount in = 0");

        bool isToken0 = _tokenIn == address(token0);
        (IERC20 tokenIn, IERC20 tokenOut, uint reserveIn, uint reserveOut) = isToken0
            ? (token0, token1, reserve0, reserve1)
            : (token1, token0, reserve1, reserve0);

        tokenIn.transferFrom(msg.sender, address(this), _amountIn);
        uint amountInWithFee = (_amountIn * 997) / 1000;
        amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);

        tokenOut.transfer(msg.sender, amountOut);

        _update(token0.balanceOf(address(this)), token1.balanceOf(address(this)));
    }

    function addLiquidity(uint _amount0, uint _amount1) external returns (uint shares) {
        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), _amount1);
        if (reserve0 > 0 || reserve1 > 0) {
            require(reserve0 * _amount1 == reserve1 * _amount0, "x / y != dx / dy");
        }
        if (totalSupply == 0) {
            shares = _sqrt(_amount0 * _amount1);
        } else {
            shares = _min(
                (_amount0 * totalSupply) / reserve0,
                (_amount1 * totalSupply) / reserve1
            );
        }
        require(shares > 0, "shares = 0");
        _mint(msg.sender, shares);

        _update(token0.balanceOf(address(this)), token1.balanceOf(address(this)));
    }

    function removeLiquidity(uint _shares)
        external
        returns (uint amount0, uint amount1)
    {
        uint bal0 = token0.balanceOf(address(this));
        uint bal1 = token1.balanceOf(address(this));

        amount0 = (_shares * bal0) / totalSupply;
        amount1 = (_shares * bal1) / totalSupply;
        require(amount0 > 0 && amount1 > 0, "amount0 or amount1 = 0");

        _burn(msg.sender, _shares);
        _update(bal0 - amount0, bal1 - amount1);

        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);
    }

    function _sqrt(uint y) private pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint x, uint y) private pure returns (uint) {
        return x <= y ? x : y;
    }
}