let KVWeb3Builder = function(ct_name, ct_address, abi, ro){
  this.chainFunctions = {
    read: {},
    write: {},
    pay: {},
    ct_name: ct_name,
    ct_address: ct_address,
    ct_abi: abi,
    ro: ro > 0 ? ro : 0,
    abi_obj: false
  };
};

KVWeb3Builder.prototype.init = function(){
  let thi = this;
  return new Promise((resolve, reject)=>{
    let process_abi = function(abi){
      for (let j = 0; j < abi.length; j++){
        if (abi[j].type == "function"){
          let fn_source = "function";
          let var_block = "(";
          for (let i = 0; i < abi[j].inputs.length; i++){
            var_block += (i > 0 ? "," : "" ) + (abi[j].inputs[i]["name"] ? abi[j].inputs[i]["name"] : abi[j].inputs[i]["type"]);
          }
          fn_source += var_block + (abi[j].stateMutability == "nonpayable" ? (abi[j].inputs.length > 0 ? "," : "" ) + "tx_update_fn": "" )+ "){ return new Promise((resolve, reject) => { KV.ContractFns.when_ready('"+thi.chainFunctions.ct_name+"').then(function(w3ct){w3ct.w3contract.methods."+abi[j].name+var_block+")";
          if (abi[j].stateMutability == "view"){
            fn_source += ".call().then(resolve).catch(reject);";
            fn_source += "})});}";
            thi.chainFunctions.read[abi[j].name] = fn_source;
          }else if (abi[j].stateMutability == "nonpayable"){
            fn_source += ".send({from: user_wallet, to: '"+thi.chainFunctions.ct_address+"', value:0}, function(err,tx){if (typeof tx_update_fn == 'function'){ tx_update_fn(tx, err); }}).then(function(res){resolve(res);}).catch(function(erx){reject(erx);});";
            fn_source += "})});}";
            thi.chainFunctions.write[abi[j].name] = fn_source;
          }else{
            //payable method
            console.error("No support for "+abi[j].stateMutability+" fns ("+abi[j].type+") right now");
          }
  
        }
      }
      resolve();
    };
    if (thi.chainFunctions.ct_abi.substring(0,4) != "http" && Array.isArray(JSON.parse(thi.chainFunctions.ct_abi)) ){
      let msgUint8 = new TextEncoder().encode(this.chainFunctions.ct_name);
      crypto.subtle.digest('SHA-1', msgUint8).then(function(hashBuffer){
        let hashArray = Array.from(new Uint8Array(hashBuffer));
        let hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        thi.chainFunctions.abi_obj = {hash: hashHex, code: JSON.parse(thi.chainFunctions.ct_abi)};
        process_abi(thi.chainFunctions.abi_obj.code);
      });
    }else{
      console.log(thi.chainFunctions.ct_abi);
      ajax({"t":thi.chainFunctions.ct_abi}, {
        "api_url": "/api/proxy.php",
        // "method": "GET"
      })
      .then(process_abi).catch(reject);
    }
  });
};
KVWeb3Builder.prototype.is_read_only = function(){
  return this.chainFunctions.ro > 0;
};

KVWeb3Builder.prototype.get_fnheader_declarations = function(){
  let declaration_block = "chain[\"read\"][\""+this.chainFunctions.ct_name+"\"] = {};";
  if (!(this.chainFunctions.ro > 0)){
    declaration_block += "chain[\"write\"][\""+this.chainFunctions.ct_name+"\"] = {};chain[\"pay\"][\""+this.chainFunctions.ct_name+"\"] = {};\n";
  }
  return declaration_block;
}

KVWeb3Builder.prototype.get_contract_init = function(){
  //TODO update this block to account for the ABI being stored in a variable if abi_json is set
  let abi_reference, init_block = "";
  if (this.chainFunctions.abi_obj){
    //the full ABI JSON was provided, so store this in a variable, and then reference the var
    
    init_block += "let abi_"+this.chainFunctions.abi_obj.hash+" = "+JSON.stringify(this.chainFunctions.abi_obj.code)+";\n";
    abi_reference = "abi_"+this.chainFunctions.abi_obj.hash;
  }else{
    abi_reference = "'"+this.chainFunctions.ct_abi+"'";
  }
  init_block += "KV.ContractFns.prepare_contract({short_name: '"+this.chainFunctions.ct_name+"',contract_address:'"+this.chainFunctions.ct_address+"',contract_abi:"+abi_reference;
  if (this.chainFunctions.ro > 0){
    init_block += ",readonly_from_chain_id: "+this.chainFunctions.ro;
  }
  init_block += "}).then(function(res){ console.log('Loaded contract "+this.chainFunctions.ct_name+"'); });\n";
  return init_block;
};

KVWeb3Builder.prototype.get_read_functions = function(){
  return this._get_functions("read");
};
KVWeb3Builder.prototype.get_write_functions = function(){
  if (this.chainFunctions.ro > 0){
    return "";
  }else{
    return this._get_functions("write");
  }
};
KVWeb3Builder.prototype.get_payable_functions = function(){
  if (this.chainFunctions.ro > 0){
    return "";
  }else{
    return this._get_functions("pay");
  }
};

KVWeb3Builder.prototype._get_functions = function(fn_type){
  let full_txt = "";
  for (fn in this.chainFunctions[fn_type]){
    if (this.chainFunctions[fn_type].hasOwnProperty(fn)){
      full_txt += "chain[\""+fn_type+"\"][\""+this.chainFunctions.ct_name+"\"][\""+fn+"\"] = "+this.chainFunctions[fn_type][fn]+"\n";
    }
  }
  return full_txt;
};
