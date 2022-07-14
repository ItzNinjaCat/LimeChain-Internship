import * as React from 'react';
import styled from 'styled-components';

import Web3Modal from 'web3modal';
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider';
import Column from './components/Column';
import Wrapper from './components/Wrapper';
import Header from './components/Header';
import Loader from './components/Loader';
import ConnectButton from './components/ConnectButton';
import Button from './components/Button';
import Book from './components/Book';


import { Web3Provider } from '@ethersproject/providers';
import { getChainData } from './helpers/utilities';

import { ethers } from "ethers";

import * as constants from './constants';
import { getContract } from './helpers/ethers';
import { parseEther , formatEther} from 'ethers/lib/utils';
import { LIBRARY_ADDRESS } from './constants';

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SLanding = styled(Column)`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

// @ts-ignore
const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

interface IAppState {
  fetching: boolean;
  address: string;
  library: any;
  connected: boolean;
  chainId: number;
  pendingRequest: boolean;
  result: any | null;
  libraryContract: any | null;
  tokenContract : any | null;
  info: any | null;
  searchText : string;
  searchResult : any | null;
  validSearch : boolean;
  ISBN : string;
  availableBooks : any;
  validISBN : boolean;
  takenBooks : any;
  depositAmount : number;
  userBalance : number;
  searchSuccess : boolean;
  home : boolean;
  depositPage : boolean;
  withdrawPage : boolean;
  takingArchivePage : boolean;
  currentlyTakenPage : boolean;
  addBookPage: boolean;
  limit : number;
  currentBlock : number;
  libraryBalance : number;
  archiveResults : any | null;
  archiveSuccess : boolean;
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: '',
  library: null,
  connected: false,
  chainId: 1,
  pendingRequest: false,
  result: null,
  libraryContract: null,
  tokenContract: null,
  info: null,
  searchText : "",
  searchResult : [],
  searchSuccess : false,
  validSearch : false,
  ISBN : "",
  validISBN : false,
  addBookPage : false,
  availableBooks : [],
  takenBooks : [],
  takingArchivePage : false,
  currentlyTakenPage : false,
  withdrawPage : false,
  depositAmount : 0,
  depositPage : false,
  userBalance : 0,
  home : true,
  limit : 0,
  currentBlock : 0,
  libraryBalance : 0,
  archiveResults : null,
  archiveSuccess : false
};

class App extends React.Component<any, any> {
  // @ts-ignore
  public web3Modal: Web3Modal;
  public state: IAppState;
  public provider: any;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE
    };

    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions()
    });
  }

  public componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      this.onConnect();
    }
  }

  public onConnect = async () => {

    this.provider = await this.web3Modal.connect();

    const library = new Web3Provider(this.provider);

    const network = await library.getNetwork();

    const address = this.provider.selectedAddress ? this.provider.selectedAddress : this.provider.accounts[0];

    const libraryContract = getContract(constants.LIBRARY_ADDRESS, constants.LIBRARY.abi, library, address);
    const tokenContract = getContract(constants.LIBRARY_TOKEN_ADDRESS, constants.LIBRARY_TOKEN.abi, library, address);
    const bal = formatEther(await libraryContract.getBalance());
    this.setState({
      library,
      chainId: network.chainId,
      address,
      connected: true,
      libraryContract,
      tokenContract,
      userBalance : bal
    });
    await this.subscribeToProviderEvents(this.provider);
    await this.getAvailableBooks();
  };



  
  public home = () => {
    this.clearSearch();
    this.clearArchive();
    this.setState({
      home : true,
      depositPage : false,
      withdrawPage : false,
      takingArchivePage : false,
      currentlyTakenPage : false,
      addBookPage: false,
      fetching : false
    });
  };

  public addBookButton = () => {
    this.clearSearch();
    this.clearArchive();
    this.setState({
      home : false,
      depositPage : false,
      withdrawPage : false,
      takingArchivePage : false,
      currentlyTakenPage : false,
      addBookPage: true,
    });
  };

  public clearArchive = () => {
    this.setState({
      archiveResults : null,
      archiveSuccess : false,
      ISBN : "",
      validISBN : false
    })
  };

  public renderarchiveResults = () => {
    return (
      <div>
        <div style = {{margin : "10px"}}>
          <h2> Search Results </h2>
          <Button children = "Reset search" onClick = {this.clearArchive}/> 
        </div>
          <Book bookObj = {this.state.archiveResults.book}>
            <p
              style ={{
                fontSize: "24px",
                fontFamily: "monospace",
                fontWeight: "bold"
              }}>
                Taken by:
            </p>
            {
              this.state.archiveResults.takenBy.map((data : any, index : number) =>
                <li key = {index}>{data}</li> 
              )
            }
          </Book>
      </div>
    )
  }

  public getarchiveResults = async () => {
    this.setState({ fetching : true })
    try{
      const { libraryContract, ISBN } = this.state;
      const book = await libraryContract.getBook(
        ethers.utils.solidityKeccak256(
          ["bytes"],
          [
            ethers.utils.defaultAbiCoder.encode
            (
              ["string"], [ISBN]
            )
          ]
        )
      );
      if(book.previouslyTaken.length === 0){
        alert("This book has never been taken");
        this.home();
        return;
      }
      const response = await fetch(constants.GOOLE_BOOKS_API +
        "isbn:" +
        ISBN +
        '&maxResults=40',
      {
        method: "GET"
      })
      const bookObj = (await response.json()).items;
      const taken = Array.from(new Set(book.previouslyTaken))
      console.log(taken)
      if(bookObj.length > 0){
        this.setState({
          archiveResults : ({book : bookObj[0].volumeInfo, takenBy : taken}),
          archiveSuccess : true,
          fetching : false,
          ISBN : "",
          validISBN : false,
        })
        console.log(this.state.archiveResults)
      }
    }
    catch(err){
      alert(err.reason);
      this.home();
    }
  };

  public rendertakingArchive = () => {
    return (
      <div>
        <form onSubmit={this.getarchiveResults}>
          <input
            type="text"
            placeholder="Book ISBN"
            value = {this.state.ISBN}
            maxLength = {13}
            onChange={this.updateISBN}
          />
          <Button children = "Search archive" type="submit" disabled={!this.state.validISBN}/>
        </form>
      </div>
    )
  };

  public takingArchiveButton = () => {
    this.clearSearch();
    this.clearArchive();
    this.setState({
      home : false,
      depositPage : false,
      withdrawPage : false,
      takingArchivePage : true,
      currentlyTakenPage : false,
      addBookPage: false,
    });
  };

  public withdrawButton = async () => {
    try {
      this.setState({ fetching : true })
      this.clearSearch();
      this.clearArchive();
      this.setState({
        home : false,
        depositPage : false,
        withdrawPage : true,
        takingArchivePage : false,
        currentlyTakenPage : false,
        addBookPage: false,
        libraryBalance : formatEther(await this.state.libraryContract.getLibraryBalance())
      });
      this.setState({ fetching : false })
    }
    catch(error){
      alert(error.reason)
      this.home();
    }

  };

  public depositButton = () => {
    this.clearSearch();
    this.clearArchive();
    this.setState({
      home : false,
      depositPage : true,
      withdrawPage : false,
      takingArchivePage : false,
      currentlyTakenPage : false,
      addBookPage: false,
    });
  }
  public calculateTime = (limit : number, present : number, start : number) => {
    return limit - (present - start);
  };

  public currentlyTakenButton = async () => {
    this.setState({ fetching : true})
    const { library, libraryContract } = this.state;


    let books : any = localStorage.getItem('takenBooks');
    if(books === null){
      books = [];
    }
    else {
      books = JSON.parse(books.toString())
    }
    for(let i = 0; i < books.length; i++){
      if(books[i].takenBy !== this.state.address){
        books.splice(i, 1);
      }
    }
    if(books.length === 0){
      alert("You currently have not taken any books");
      this.home();
      return;
    }
    this.clearSearch();
    this.clearArchive();
    this.setState({
      home : false,
      depositPage : false,
      withdrawPage : false,
      takingArchivePage : false,
      currentlyTakenPage : true,
      addBookPage: false,
      limit : (await libraryContract.returnBlockLimit()).toNumber(),
      currentBlock : (await library.getBlockNumber()),
      takenBooks : books
    });
    this.setState({ fetching : false});
  };

  public renderWithdraw = () => {
    return (
      <div>
        <p
        style ={{
          fontSize: "24px",
          fontFamily: "monospace",
          fontWeight: "bold"
        }}
        >Fees available for withdrawing :  {this.state.libraryBalance} LIB (ETH:LIB - 1:1)</p>
        {this.state.connected && <Button children = "Withdraw" onClick={this.withdraw} />}
      </div>
    )
  };
  
  public  renderCurrentlyTaken = () => {
    const { limit, currentBlock, takenBooks } = this.state;
    return (
      <div>
        {
          takenBooks.map((data: any) =>

          <Book
            key = {data.book[0].id} bookObj = {data.book[0].volumeInfo}
            color = {
              this.calculateTime(limit, currentBlock, data.startDate) > 0 ? 
              "#4099ff80" : "red"
            }
          >
            <p > Blocks left before fine - {
              this.calculateTime(limit, currentBlock, data.startDate) > 0 ? 
              this.calculateTime(limit, currentBlock, data.startDate) : 0
            }</p>
            <Button children = "Return book" onClick = {() => this.returnBook(data.book[0].volumeInfo.industryIdentifiers[0].identifier)}/>
          </Book>
          )  
        }
      </div>
    )
  };

  public withdraw = async () => {
    this.setState({ fetching: true });
    const { libraryContract } = this.state;
    try{
      const transaction = await libraryContract.withdraw();
    
      this.setState({ transactionHash: transaction.hash });
      
      const transactionReceipt = await transaction.wait();
      if (transactionReceipt.status !== 1) { 
        alert('Failed to withdraw');
      }
    }
    catch(error){
      alert(error.reason)
    }
    this.setState({ fetching: false });
    this.home();
  };

  public searchForBook = async (e : any) => {
    await this.setState({ fetching: true });
    e.persist();
    const response = await fetch(constants.GOOLE_BOOKS_API + 
      this.state.searchText +
      '&maxResults=40',
    {
      method: "GET"
    })
    const responseJson = (await response.json());
    if(responseJson.totalItems === 0){
      alert("No results");
    }
    else{
      responseJson.items.map((data : any , index :  number) => {
        if(data.volumeInfo.industryIdentifiers){
          data.volumeInfo.industryIdentifiers.map((identifier : any) => {
            if(identifier.type === "OTHER"){
              try{
                responseJson.items.splice(index, 1);
              }
              catch{
                // pass
             }
            }
          })
        }
        else{
          responseJson.items.splice(index, 1);
        }
      });
      // console.log(responseJson.items);
      if(responseJson.items.length > 0){
        this.setState({
          searchResult : responseJson.items,
          searchSuccess : true
        });   
      }else{
        alert("No results");
      }
    }
    this.setState({ 
      fetching: false,
      searchText : "",
      validSearch : false 
    });
  };

  public addBook = async (ISBN : any) => {
    await this.setState({ fetching: true });
    // console.log(ISBN);
    const { libraryContract } = this.state;
    try{
      const transaction = await libraryContract.addBook(ISBN);
      this.setState({ transactionHash: transaction.hash });
      
      const transactionReceipt = await transaction.wait();
      await libraryContract.on("addBookEvent", (id : any, book : any) => {
        console.log(book);
      });
      if (transactionReceipt.status !== 1) { 
        alert('Failed to add book');
      }
      this.setState({ fetching: false });
      this.clearSearch();
      await this.getAvailableBooks();
    }
    catch(error){
      alert(error.reason);
    }
    this.home();
  }

  public addBookCheck = async (e : any) => {
    e.preventDefault();
		const { ISBN } = this.state;
		await this.setState({ fetching: true });
    const response = await fetch(constants.GOOLE_BOOKS_API +
      "isbn:" +
      ISBN +
      '&maxResults=40',
    {
      method: "GET"
    })
    this.setState({ fetching: false });
    if((await response.json()).totalItems === 0){
      alert("Incorrect ISBN");
    }
    else{
      this.addBook(ISBN);
    }
    this.setState({
      ISBN : "",
      validISBN : false
    });
  };

  public updateISBN = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.value.length === 10 || e.target.value.length === 13){
      this.setState({
        validISBN : true,
        ISBN : e.target.value
      });
    }
    else{
      this.setState({
        validISBN : false,
        ISBN : e.target.value
      });
    }
  };
  public updateSearchText = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.value.length > 0){
      this.setState({ validSearch : true })
    }
    else{
      this.setState({ validSearch : false })
    }
    this.setState({
      searchText : e.target.value
    });
  };

  public updateDeposit = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        depositAmount : e.target.value
      });
  }
  public clearSearch = () => {
    this.setState({
      searchSuccess : false,
      searchResults : [],
      searchText : ""
    })
  };

  public getAvailableBooks = async () => {
    const { libraryContract } = this.state;
    this.setState({ fetching: true });
    const availableLen = await libraryContract.getAvailableBooksLength();
    const avaialbleISBN = [];
    for(let i = 0; i < availableLen; i++){
      avaialbleISBN.push((await libraryContract.getAvailableBook(i)).isbn);
    }
    const availableBooksTmp : any = [];
    await Promise.all(avaialbleISBN.map( async (data : any) => {
      const response = await fetch(constants.GOOLE_BOOKS_API +
        "isbn:" +
        data +
        '&maxResults=40',
      {
        method: "GET"
      })
      availableBooksTmp.push((await response.json()).items[0])
    }))

    this.setState({
      availableBooks : Object.assign([], availableBooksTmp)
    });
    this.setState({ fetching: false });
  };


  public borrowBook = async (ISBN : string) =>{
    this.setState({ fetching: true });
    const { library, libraryContract } = this.state;
    try{
      const amount = formatEther((await libraryContract.takingFee()).toBigInt() + (await libraryContract.returnFine()).toBigInt());
      const signature = await this.onAttemptToApprove(amount);
      const transaction = await libraryContract.borrowBook(ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(["string"], [ISBN])),
        parseEther(amount),
        signature.deadline,
        signature.v,
        signature.r,
        signature.s
        );
      this.setState({ transactionHash: transaction.hash });
      
      const transactionReceipt = await transaction.wait();
      await libraryContract.on("borrowBookEvent", (id : any, book : any) => {
        console.log(id, book);
      });
      if (transactionReceipt.status !== 1) { 
        alert('Failed to take book');
      }
      else{
        const bookObj = await fetch(constants.GOOLE_BOOKS_API +
          "isbn:" +
          ISBN +
          '&maxResults=40',
        {
          method: "GET"
        })
        const bookItems = (await bookObj.json()).items;
        console.log(bookItems);
        let takenBooks : any = localStorage.getItem('takenBooks');
        if(takenBooks === null){
          takenBooks = [];
        }
        else {
          takenBooks = JSON.parse(takenBooks.toString())
        }
        takenBooks.push({book : bookItems, startDate : await library.getBlockNumber(), takenBy : this.state.address});
        localStorage.setItem('takenBooks', JSON.stringify(takenBooks));
      }
      this.setState({
        userBalance : formatEther(await libraryContract.getBalance())
      });
    }
    catch(error){
      alert(error.reason);
    }
    this.setState({ fetching: false });
    await this.getAvailableBooks();
  };

  public returnBook = async (ISBN : string) =>{
    this.setState({ fetching: true });
    const { libraryContract } = this.state;
    const transaction = await libraryContract.returnBook(ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["string"], [ISBN])));
  
    this.setState({ transactionHash: transaction.hash });
    
    const transactionReceipt = await transaction.wait();
    await libraryContract.on("returnBookEvent", (id : any, book : any) => {
      console.log(id, book);
    });
    if (transactionReceipt.status !== 1) { 
      alert('Failed to return book');
    }
    else{
      let takenBooks : any = localStorage.getItem('takenBooks');
      takenBooks = JSON.parse(takenBooks.toString());
      for(let i = 0; i < takenBooks.length; i++){
        if(takenBooks[i].book[0].volumeInfo.industryIdentifiers[0].identifier === ISBN){
          takenBooks.splice(i, 1);
          localStorage.setItem('takenBooks', JSON.stringify(takenBooks));
          break;
        }
      }
      this.setState({
        userBalance : formatEther(await libraryContract.getBalance())
      });
    }
    this.setState({ fetching: false });
    this.getAvailableBooks();
  };
  public subscribeToProviderEvents = async (provider:any) => {
    if (!provider.on) {
      return;
    }

    provider.on("accountsChanged", this.changedAccount);
    provider.on("chainChanged", this.networkChanged);
    provider.on("disconnect", this.close);

    await this.web3Modal.off('accountsChanged');
  };

  public async unSubscribe(provider:any) {
    // Workaround for metamask widget > 9.0.3 (provider.off is undefined);
    window.location.reload(false);
    if (!provider.off) {
      return;
    }

    provider.off("accountsChanged", this.changedAccount);
    provider.off("chainChanged", this.networkChanged);
    provider.off("disconnect", this.close);
  }

  public changedAccount = async (accounts: string[]) => {
    if(!accounts.length) {
      // Metamask Lock fire an empty accounts array 
      await this.resetApp();
    } else {
      this.setState({address: accounts[0]})
      await this.resetApp();
    }
  }

  public networkChanged = async (networkId: number) => {
    const library = new Web3Provider(this.provider);
    const network = await library.getNetwork();
    const chainId = network.chainId;
    this.setState({ chainId, library });
  }
  
  public close = async () => {
    this.resetApp();
  }

  public getNetwork = () => getChainData(this.state.chainId).network;

  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID
        }
      }
    };
    return providerOptions;
  };


  public resetApp = async () => {
    await this.web3Modal.clearCachedProvider();
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
    await this.unSubscribe(this.provider);

    this.setState({ ...INITIAL_STATE });

  };

  public async onAttemptToApprove(amount : any) {
      const { tokenContract, address, library } = this.state;
      
      const nonce = (await tokenContract.nonces(address)); // Our Token Contract Nonces
      const deadline = + new Date() + 60 * 60; // Permit with deadline which the permit is valid
      const wrapValue = parseEther(amount); // Value to approve for the spender to use
      
      const EIP712Domain = [ // array of objects -> properties from the contract and the types of them ircwithPermit
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'verifyingContract', type: 'address' }
      ];

      const domain = {
          name: await tokenContract.name(),
          version: '1',
          verifyingContract: tokenContract.address
      };

      const Permit = [ // array of objects -> properties from erc20withpermit
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
      ];

      const message = {
          owner: address,
          spender: LIBRARY_ADDRESS,
          value: wrapValue.toString(),
          nonce: nonce.toHexString(),
          deadline
      };

      const data = JSON.stringify({
          types: {
              EIP712Domain,
              Permit
          },
          domain,
          primaryType: 'Permit',
          message
      })

      const signatureLike = await library.send('eth_signTypedData_v4', [address, data]);
      const signature = await ethers.utils.splitSignature(signatureLike);

      const preparedSignature = {
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline
      }

      return preparedSignature;
  }

  public deposit = async () => {
    this.setState({ fetching: true });
    const { libraryContract } = this.state;
    const bal = formatEther((this.state.depositAmount * 10e17).toString());
    const transaction = await libraryContract.deposit({value : parseEther(bal)});
  
    this.setState({ transactionHash: transaction.hash });
    
    const transactionReceipt = await transaction.wait();
    if (transactionReceipt.status !== 1) { 
      alert('Failed to withdraw');
    }
    else{
      this.setState({
        userBalance : formatEther(await libraryContract.getBalance())
      })
    }
    this.setState({ fetching: false });
    this.home();
  };

  public  renderAvailableBooks = () => {
    return (
      <div>
      <h2> Available books </h2> 
      {
        this.state.availableBooks.map((data: any) =>
        <Book key = {data.id} bookObj = {data.volumeInfo}>
            <Button children = "Take book" onClick = {() => this.borrowBook(data.volumeInfo.industryIdentifiers[0].identifier)}/>
        </Book>
        )
      }
      </div>
    )
  };

  public renderDepositForm = () => {
    return (
      <div>
        <form onSubmit={this.deposit}>
          <input
            type="number"
            step="0.1"
            placeholder="Deposit Amount"
            value = {this.state.depositAmount}
            onChange={this.updateDeposit}
          />
          <Button children = "Deposit" type="submit" disabled={this.state.depositAmount === 0}/>
        </form>
      </div>
    )
  };


  public renderAddBookForm = () => {
    return (
      <div>
        <form onSubmit={this.addBookCheck}>
          <input
            type="text"
            placeholder="Book ISBN"
            value = {this.state.ISBN}
            maxLength = {13}
            onChange={this.updateISBN}
          />
          <Button children = "Add book" type="submit" disabled={!this.state.validISBN}/>
        </form>
      </div>
    )
  };

  public renderSearchBookForm = () => {
    return (
      <div>
        <form onSubmit={this.searchForBook} >
          <input
            type="text"
            placeholder="Book title/author/subtitle"
            value = {this.state.searchText}
            onChange={this.updateSearchText}
          />
          <Button type = "submit" children = "Search for book" onClick = {this.searchForBook} disabled = {!this.state.validSearch}/>
        </form>  
      </div>
    )
  };

  public renderSearchResults = () => {
    return (
      <div>
        <div style = {{margin : "10px"}}>
          <h2> Search Results </h2>
          <Button children = "Reset search" onClick = {this.clearSearch}/> 
        </div>
        {
          this.state.searchResult.map((data: any) =>
          <Book key = {data.id} bookObj = {data.volumeInfo}>
              <Button children = "Add Book" onClick = {() => this.addBook(data.volumeInfo.industryIdentifiers[0].identifier)}/>
          </Book>
          )
        }
      </div>
    )
  };

  public render = () => {
    const {
      address,
      connected,
      chainId,
      fetching,
      userBalance
    } = this.state;
    return (
      <SLayout>
        <Column spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            balance = {userBalance}
            killSession={this.resetApp}
            >
              {fetching ? (
                <br/>
              ) : (
                <ul style = {{
                  backgroundColor: "none",
                  textAlign: "center",
                  borderRadius : "8px"
    
                }}>
                  {this.state.connected && <Button children = "Home" onClick={this.home} borderRadius = "8px  0 0 8px"/>}
                  {this.state.connected && <Button children = "Add book" onClick={this.addBookButton} borderRadius = "0px"/>}
                  {this.state.connected && <Button children = "Taken books" onClick={this.currentlyTakenButton} borderRadius = "0px" />}
                  {this.state.connected && <Button children = "Book taking archive" onClick={this.takingArchiveButton} borderRadius = "0px" />}
                  {this.state.connected && <Button children = "Deposit" onClick={this.depositButton} borderRadius = "0px" />}
                  {this.state.connected && <Button children = "Withdraw" onClick={this.withdrawButton} borderRadius = "0  8px 8px 0"/>}
                </ul>
              )}
            </Header>                      
          <SContent>
            {fetching ? (
              <Column center>
                <SContainer>
                  <Loader/>
                </SContainer>
              </Column>
            ) : (
              <SLanding center>
                {!this.state.connected && <ConnectButton onClick={this.onConnect} />}
                {
                    this.state.takingArchivePage && 
                    this.state.connected &&
                    this.rendertakingArchive()    
                }
                {
                    this.state.archiveSuccess && 
                    this.state.connected &&
                    this.renderarchiveResults()    
                }
                {
                  this.state.depositPage && 
                  this.state.connected &&
                  this.renderDepositForm()
                }
                {
                  this.state.withdrawPage && 
                  this.state.connected &&
                  this.renderWithdraw()
                }
                {
                  this.state.connected &&
                  this.state.addBookPage &&
                  this.renderAddBookForm()
                }
                {
                  this.state.connected &&
                  this.state.addBookPage &&
                  this.renderSearchBookForm()
                }
                {
                    this.state.home && 
                    this.state.connected && 
                    this.state.availableBooks.length > 0 &&
                    this.renderAvailableBooks()
                }
                {
                  this.state.currentlyTakenPage && 
                  this.state.connected &&
                  this.renderCurrentlyTaken()
                }


                {  
                  this.state.addBookPage && this.state.searchSuccess && 
                  this.renderSearchResults() 
                }
              </SLanding>
            )}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
