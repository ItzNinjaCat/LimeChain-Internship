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

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { Web3Provider } from '@ethersproject/providers';
import { getChainData } from './helpers/utilities';


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
  addingBook: boolean;
  searchText : string;
  addingBookISBN : string;
  availableBooks : any;
  availableState : boolean;
  searchResult : any | null;
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
  addingBook : false,
  searchText : "",
  searchResult : [],
  addingBookISBN : "",
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

  };

  public addBookButton = async () => {
    await this.setState({
      addingBook : true
    });
  };

  public searchForBook = async (e : any) => {
    e.preventDefault();
    const response = await fetch(constants.GOOLE_BOOKS_API + 
      this.state.searchText +
      '&maxResults=40&key=' + 
      process.env.REACT_APP_GOOGLE_API_KEY,
    {
      method: "GET"
    })
    await this.setState({
      searchResult : (await response.json()).items
    });
    console.log(this.state.searchResult);
  };

  public addBook = async (e : any) => {
    e.preventDefault();
    const { libraryContract, addingBookISBN} = this.state;
		
		await this.setState({ fetching: true });
    const response = await fetch(constants.GOOLE_BOOKS_API +
      "isbn:" +
      addingBookISBN +
      '&maxResults=40&key=' + 
      process.env.REACT_APP_GOOGLE_API_KEY,
    {
      method: "GET"
    })
    if((await response.json()).totalItems === 0){
      alert("Incorrect ISBN");
    }
    else{
      console.log(this.state.searchResult);
      const transaction = await libraryContract.addBook(addingBookISBN);
  
      await this.setState({ transactionHash: transaction.hash });
      
      const transactionReceipt = await transaction.wait();
      libraryContract.on("addBookEvent", (id : any, book : any) => {
        console.log(id, book);
      });
      if (transactionReceipt.status !== 1) { 
        alert('This is an alert message');
      }  
    }
    this.setState({
      addingBook : false,
      addingBookISBN : "",
      fetching: false
    });
  };

  public updateISBN = async (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      addingBookISBN : e.target.value
    });
  };
  public updateSearchText = async (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      searchText : e.target.value
    });
  };

  public getAvailableBooks = async () => {
    const { libraryContract } = this.state;
    console.log(this.state.searchResult);
    const tmp = await libraryContract.getAvailableBooks();
    this.setState({
      availableState : true,
      availableBooks : Object.assign([], tmp)
    });


    
  };


  // public takeBook = async () =>{
    
  // };

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
          <SContent>
            {fetching ? (
              <Column center>
                <SContainer>
                  <Loader />
                </SContainer>
              </Column>
            ) : (
                <SLanding center>
                  {!this.state.connected && <ConnectButton onClick={this.onConnect} />}
                  {this.state.connected && !this.state.addingBook && <Button children = "Add book" onClick={this.addBookButton} />}
                  {/* {this.state.connected && !this.state.addingBook && <Button children = "Borrow book" onClick={this.takeBook} />} */}
                  {this.state.connected && this.state.addingBook &&
                    <form onSubmit={this.searchForBook}>
                      <input
                        type="text"
                        placeholder="Book title"
                        value = {this.state.searchText}
                        onChange={this.updateSearchText}
                      />
                      
                      <Popup  trigger = {open => (<Button children = "Search for book" type="submit"/>)} position="right center" modal>
                        <ul style = {{overflowY : 'scroll', height:"200px"}}>
                        {this.state.searchResult.map((data: any) =>
                          <li key = {data.id} style = {{backgroundColor : "#fff"}}>
                            Title : {data.volumeInfo.title} <br/>
                            Subtitle : {data.volumeInfo.subtitle} <br/>
                            Author : {data.volumeInfo.authors} <br/>
                            Publish date : {data.volumeInfo.publishedDate}
                          </li>)}                         
                        </ul>
                      </Popup>
                    </form>
                  }
                  {this.state.connected && this.state.addingBook &&
                    
                    <form onSubmit={this.addBook}>
                      <input
                        type="text"
                        placeholder="Book ISBN"
                        value = {this.state.addingBookISBN}
                        onChange={this.updateISBN}
                      />
                      <Button children = "Add book" type="submit"/>
                    </form>
                  }
                  { this.state.availableState && !this.state.addingBook &&
                    this.state.availableBooks.map((name: any, index : number) =><li key = {index}>{name}</li>)
                  }                                
                  {this.state.connected && !this.state.addingBook && <Button children = "List available books" onClick={this.getAvailableBooks} />}
                </SLanding>
              )}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
