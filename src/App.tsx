import * as React from "react";
import logo from './logo.svg';
import './App.css';

type MyProps = {
};

type MyState = {
  exportEndpointUrl: string;
};

type MySettings = {
  exportEndpointUrl: string;
}

class App extends React.Component<MyProps, MyState> {
  
  constructor(props:MyProps){
    super(props);
    this.state = {exportEndpointUrl:''};
    this.exportEndpointUrlChanged = this.exportEndpointUrlChanged.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.loadSettings = this.loadSettings.bind(this);
    this.loadSettings();
  }

  saveSettings(){
    const settings:MySettings = {
       exportEndpointUrl:this.state.exportEndpointUrl
    };
    chrome.storage.sync.set({'settings':settings});
  }

  loadSettings(){
    const loadSettingsCallBack = (data:any) => {
      const settings:MySettings = data.settings;
      console.log(data);
      console.log(settings);
      console.log(this.setState);
      this.setState(settings);
    };

    chrome.storage.sync.get('settings', loadSettingsCallBack.bind(this) )
  }

  exportEndpointUrlChanged(e: React.ChangeEvent<HTMLInputElement>){
    this.setState({exportEndpointUrl: e.target.value })
  }

  render(){
  return (
    <div className="App">
      <section>
        <div>
          <label>Export Endpoint URL:</label>
          <input onChange={this.exportEndpointUrlChanged} value={this.state.exportEndpointUrl}></input>
          <button  onClick={this.saveSettings}>Save</button>
        </div>
      </section>
      <footer className="">
       <p> Built with <img src={logo} className="App-logo" alt="logo" /></p>
      </footer>
    </div>
  );
  }
}

export default App;
