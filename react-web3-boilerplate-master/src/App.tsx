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
  height: 600px;
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
  info: any | null;
  searchText : string;
  searchResult : any | null;
  searchSuccess : boolean;
  validSearch : boolean;
  addingBook: boolean;
  addingBookISBN : string;
  availableBooks : any;
  availableState : boolean;
  validISBN : boolean;
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
  info: null,
  searchText : "",
  searchResult : [],
  searchSuccess : false,
  validSearch : false,
  addingBookISBN : "",
  validISBN : false,
  addingBook : false,
  availableBooks : [],
  availableState : false
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

    await this.setState({
      library,
      chainId: network.chainId,
      address,
      connected: true,
      libraryContract
    });

    await this.subscribeToProviderEvents(this.provider);

    await this.getAvailableBooks();
  };

  public addBookButton = async () => {
    await this.setState({
      addingBook : true,
      searchSuccess : false
    });
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
      console.log(responseJson.items);
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
    console.log(ISBN);
    const { libraryContract } = this.state;
    const transaction = await libraryContract.addBook(ISBN);
  
    await this.setState({ transactionHash: transaction.hash });
    
    const transactionReceipt = await transaction.wait();
    await libraryContract.on("addBookEvent", (id : any, book : any) => {
      console.log(book);
    });
    if (transactionReceipt.status !== 1) { 
      alert('Failed to add book');
    }
    this.setState({
      addingBook : false,
      fetching: false
    });
  }

  public addBookCheck = async (e : any) => {
    e.preventDefault();
		const { addingBookISBN } = this.state;
		await this.setState({ fetching: true });
    const response = await fetch(constants.GOOLE_BOOKS_API +
      "isbn:" +
      addingBookISBN +
      '&maxResults=40',
    {
      method: "GET"
    })
    await this.setState({ fetching: false });
    if((await response.json()).totalItems === 0){
      alert("Incorrect ISBN");
    }
    else{
      this.addBook(addingBookISBN);
    }
    this.setState({
      addingBookISBN : "",
      validISBN : false
    });
  };

  public updateISBN = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.value.length === 10 || e.target.value.length === 13){
      this.setState({
        validISBN : true,
        addingBookISBN : e.target.value
      });
    }
    else{
      this.setState({
        validISBN : false,
        addingBookISBN : e.target.value
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

  public clearSearch = async () => {
    await this.setState({
      searchSuccess : false,
      searchResults : [],
      searchText : ""
  })
  }

  public getAvailableBooks = async () => {
    const { libraryContract } = this.state;
    await this.setState({ fetching: true });
    const avaialbleISBN = await libraryContract.getAvailableBooks();
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
      availableState : true,
      availableBooks : Object.assign([], availableBooksTmp)
    });
    await this.setState({ fetching: false });
  };


  public takeBook = async (ISBN : string) =>{
    console.log(await this.state.library.getBlockNumber());
    await this.setState({ fetching: true });
    const { libraryContract } = this.state;
    const transaction = await libraryContract.takeBook(ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["string"], [ISBN])),
      {value: ethers.utils.parseEther("0.00000000000000050")}
    );
  
    await this.setState({ transactionHash: transaction.hash });
    
    const transactionReceipt = await transaction.wait();
    await libraryContract.on("addBookEvent", (id : any, book : any) => {
      console.log(id, book);
    });
    if (transactionReceipt.status !== 1) { 
      alert('Failed to take book');
    }
    console.log(await this.state.library.getBlockNumber());
    await this.setState({ fetching: false });
    await this.getAvailableBooks();
  };

  public returnBook = async () =>{
    console.log("here");
  };
  public subscribeToProviderEvents = async (provider:any) => {
    if (!provider.on) {
      return;
    }

    provider.on("accountsChanged", this.changedAccount);
    provider.on("networkChanged", this.networkChanged);
    provider.on("close", this.close);

    await this.web3Modal.off('accountsChanged');
  };

  public async unSubscribe(provider:any) {
    // Workaround for metamask widget > 9.0.3 (provider.off is undefined);
    window.location.reload(false);
    if (!provider.off) {
      return;
    }

    provider.off("accountsChanged", this.changedAccount);
    provider.off("networkChanged", this.networkChanged);
    provider.off("close", this.close);
  }

  public changedAccount = async (accounts: string[]) => {
    if(!accounts.length) {
      // Metamask Lock fire an empty accounts array 
      await this.resetApp();
    } else {
      await this.setState({ address: accounts[0] });
    }
  }

  public networkChanged = async (networkId: number) => {
    const library = new Web3Provider(this.provider);
    const network = await library.getNetwork();
    const chainId = network.chainId;
    await this.setState({ chainId, library });
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

  public render = () => {
    const {
      address,
      connected,
      chainId,
      fetching
    } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.resetApp}
          />
          <div>
            {this.state.connected && !this.state.addingBook && <Button children = "Add book" onClick={this.addBookButton} />}
            {/* {this.state.connected && !this.state.addingBook && <Button children = "List available books" onClick={this.getAvailableBooks}/>} */}
          </div>                            
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
                  {/* {this.state.connected && !this.state.addingBook && <Button children = "Borrow book" onClick={this.takeBook} />} */}
                  {this.state.connected && this.state.addingBook &&
                    
                    <form onSubmit={this.addBookCheck}>
                      <input
                        type="text"
                        placeholder="Book ISBN"
                        value = {this.state.addingBookISBN}
                        maxLength = {13}
                        onChange={this.updateISBN}
                      />
                      <Button children = "Add book" type="submit" disabled={!this.state.validISBN}/>
                    </form>
                  }
                  {this.state.connected && this.state.addingBook &&
                    <form onSubmit={this.searchForBook} >
                      <input
                        type="text"
                        placeholder="Book title/author/subtitle"
                        value = {this.state.searchText}
                        onChange={this.updateSearchText}
                      />
                      <Button type = "submit" children = "Search for book" onClick = {this.searchForBook} disabled = {!this.state.validSearch}/>
                      { this.state.searchSuccess &&
                      <div style = {{overflowY : "scroll", height: "500px", borderRadius : "20px"}}>
                        <h2> Search Results </h2>
                        <Button children = "Close search" onClick = {this.clearSearch}/>
                          {
                            this.state.searchResult.map((data: any) =>
                              <Book key = {data.id} bookObj = {data.volumeInfo}>
                                <Button children = "Add Book" onClick = {() => this.addBook(data.volumeInfo.industryIdentifiers[0].identifier)}/>
                              </Book>
                              )
                          }
                      </div>
                      }
                    </form>       
                  }
                   {
                    !this.state.addingBook && this.state.connected && 
                    <div style = {{overflowY : "scroll", height: "500px", borderRadius : "20px"}}>
                      {
                        this.state.availableBooks.map((data: any) =>
                        <Book key = {data.id} bookObj = {data.volumeInfo}>
                          {
                            <Button children = "Take book" onClick = {() => this.takeBook(data.volumeInfo.industryIdentifiers[0].identifier)}/>
                          }
                          {
                            <Button children = "Return book" onClick = {this.returnBook}/>
                          }
                        </Book>
                      )
                      }    
                    </div>
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
