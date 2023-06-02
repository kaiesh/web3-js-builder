/**
 usage:

 builder(
   [{name, address, abi_url/abi_json_string, ro_network}]
   {
     web3network: <network ID>,
     infuraID: <infura ID>
   }
 ).then(function(js_code){
   //choose where you want the js_code to be output
   console.log(js_code);
 });

 **/
var ajax = function(e,r){var t="";for(var n in e)e.hasOwnProperty(n)&&(t+=(""==t?"":"&")+n+"="+encodeURIComponent(e[n]));var o={api_url:"/api/",request_header:"application/x-www-form-urlencoded",json_return:!0,method:"POST"};if("object"==typeof r)for(n in r)r.hasOwnProperty(n)&&(o[n]=r[n]);return new Promise(((e,r)=>{var n=new XMLHttpRequest;n.open(o.method,o.api_url),n.setRequestHeader("Content-Type",o.request_header),n.onload=function(){if(200===n.status){var t=o.json_return?JSON.parse(n.responseText):n.responseText;e(t)}else r({status:"fail",resp:t})},n.send(t)}))};
var shield = function ( s, h, i, e, l, d ){ var g = document.createElement(e); g.src = s; if (typeof h=="function") g.onload=h; g.async="async"; document.getElementsByTagName(i)[l].appendChild(g);};

/***
 * Provide an array of {name, address, abi_url/abi_json_string, ro_network (optional)}
 * Options to provide:
 * - infuraID: InfuraID (used if any non-BSC RO contracts)
 * - web3network: Web3 network ID
 */
let builder = function(cts, options){
  function generate_code(arr, ops){
    //split contracts into RO and RW
    let ro_cts = [], rw_cts = [], declaration_block = "";
    for (let i = 0; i < arr.length; i++){
      if (arr[i].is_read_only()){
        ro_cts.push(arr[i]);
      }else{
        rw_cts.push(arr[i]);
      }
      declaration_block += arr[i].get_fnheader_declarations();
    }

    let all_code = '//NOTE: The "chain" variable is declared here. Feel free to move it if you need to adjust the scope '+"\n";
    all_code += 'let chain={read:{},write:{},pay:{}};'+"\n";
    all_code += '//Declare the wallet_address variable to store the reference to the currently connected wallet'+"\n";
    all_code += "let user_wallet;\n";
    all_code += declaration_block+"\n";
    all_code += "\n\n"+'/** ATTENTION: You should customise this function to match your site requirements.'+"\n";
    all_code += ' * This is where all the action happens. This method is fired once all the web3'+"\n";
    all_code += ' * libraries are loaded and the DOM is ready to be hooked into.'+"\n";
    all_code += ' **/'+"\n"
    all_code += "let init_all = function(res){\n";
    all_code += '  //For a full list of all WalletUIHandler hooks, events, and examples, visit https://www.github.com/kaiesh/connect-web3-wallets'+"\n";
    all_code += '  //Initialise the Wallet UI manager'+"\n";
    all_code += "  let walletui = new KV.WalletUIHandler({\n";
    all_code += '    //UPDATE THESE REFERENCES FOR YOUR DOM'+"\n";
    all_code += '    parent_container: document.getElementById("walletmodal"),'+"\n";
    all_code += '    btn_connect: document.getElementById("connect_btn"),'+"\n";
    if (typeof ops == "object" && typeof ops.web3network == "number"){
      all_code += '    web3network: '+ops.web3network+",\n";
    }
    all_code += '    //ADD ADDITIONAL WALLETUI PROPS HERE'+"\n"
    all_code += "  })\n;"
    all_code += '  //Contracts with write requirements will be created once a wallet is connected'+"\n";
    all_code += '  walletui.on("wallet_connected", function(wallet_addr){'+"\n";
    all_code += '    //store the address of the connected wallet'+"\n";
    all_code += '    user_wallet = wallet_addr;'+"\n";
    if (rw_cts.length > 0){
      all_code += '    //load all RW contracts'+"\n";
      for (let i = 0; i < rw_cts.length; i++){
        all_code += '    ' + rw_cts[i].get_contract_init()+"\n";
      }
    }
    all_code += '    //NOTE: ADD ALL ACTIONS THAT SHOULD BE CARRIED OUT HERE ONCE THE WALLET IS CONNECTED'+"\n";
    all_code += '    // --- your code after wallet init goes here ---'+"\n";
    all_code += '  });'+"\n";
    if (ro_cts.length > 0){
      all_code += '  //Web3 handlers are available, so initialise all read-only contracts'+"\n";
      for (let i = 0; i < ro_cts.length; i++){
        all_code += '  ' + ro_cts[i].get_contract_init()+"\n";
      }
    }
    all_code +=  "}\n";
    all_code += '/** End of init block **/'+"\n";
    all_code += '//prepare the procedure that will ready all web3 mgmt once the interface libraries are loaded';
    all_code += "\nlet web3_init_fn = function(){\n";
    if (typeof ops == "object" && typeof ops.infuraID == "string"){
      all_code += '  //set Infura API key'+"\n";
      all_code += "   KV.set_infuraID('"+ops.infuraID+"');\n";
    }
    all_code += '  //Retrieve and initialise the remaining Web3 libraries to support wallet connectivity'+"\n";
    all_code += '  //upon completion, launch the fn that will bind to the DOM and hook into wallet events'+"\n";
    all_code += '  KV.init(["https://cdn.kaiesh.com/js/KV.WalletUIHandler.latest.min.js", "https://cdn.kaiesh.com/js/KV.ContractFns.latest.min.js"]).then(init_all);'+"\n";
    all_code += "}\n";
    all_code += '//Define all the JS handlers to communicate with the web3 contract'+"\n";
    //TODO - layout section for walletUI connection, then hook into wallet connection area to support RW cts, close with RO cts
    //group by contract (ignore option settings for now)
    for (let i = 0; i < arr.length; i++){
      all_code += arr[i].get_read_functions()+"\n";
      all_code += arr[i].get_write_functions()+"\n";
      // all_code += arr[i].get_payable_functions()+"\n";
    }
    all_code += '//Define some necessary functions for operations'+"\n"+'var ajax = function(e,r){var t="";for(var n in e)e.hasOwnProperty(n)&&(t+=(""==t?"":"&")+n+"="+encodeURIComponent(e[n]));var o={api_url:"/api/",request_header:"application/x-www-form-urlencoded",json_return:!0,method:"POST"};if("object"==typeof r)for(n in r)r.hasOwnProperty(n)&&(o[n]=r[n]);return new Promise(((e,r)=>{var n=new XMLHttpRequest;n.open(o.method,o.api_url),n.setRequestHeader("Content-Type",o.request_header),n.onload=function(){if(200===n.status){var t=o.json_return?JSON.parse(n.responseText):n.responseText;e(t)}else r({status:"fail",resp:t})},n.send(t)}))};var shield = function ( s, h, i, e, l, d ){ var g = document.createElement(e); g.src = s; if (typeof h=="function") g.onload=h; g.async="async"; document.getElementsByTagName(i)[l].appendChild(g);};'+"\n";
    all_code += "\n"+'//With all definitions in place, pull the primary web3 library down and kick-start everything'+"\n";
    all_code += "\n"+'shield("https://cdn.kaiesh.com/js/KV.latest.min.js", web3_init_fn, "head", "script", 0);';
    return all_code;
  };

  return new Promise((resolve, reject) => {
    let parsed = [];
    for (let i = 0; i < cts.length; i++){
      let this_ct = new KVWeb3Builder(cts[i].name, cts[i].address, cts[i].abi_url, cts[i].ro_network);
      this_ct.init().then(function(){
        parsed.push(this_ct);
        if (parsed.length == cts.length){
          resolve(generate_code(parsed, options));
        }
      }).catch(reject);
    }
  });
}
