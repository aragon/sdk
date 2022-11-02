<a name="ClientEstimation"></a>

## ClientEstimation
<p>Provider a generic client with high level methods to manage and interact with DAO's</p>

**Kind**: global class  

* [ClientEstimation](#ClientEstimation)
    * [.create(_params)](#ClientEstimation+create) ⇒ <code>\*</code>
    * [.deposit(params)](#ClientEstimation+deposit) ⇒ <code>\*</code>
    * [.updateAllowance(_params)](#ClientEstimation+updateAllowance) ⇒ <code>\*</code>

<a name="ClientEstimation+create"></a>

### clientEstimation.create(_params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a DAO</p>

**Kind**: instance method of [<code>ClientEstimation</code>](#ClientEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>ICreateParams</code> | 

<a name="ClientEstimation+deposit"></a>

### clientEstimation.deposit(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of depositing ether or an ERC20 token into the DAO
This does not estimate the gas cost of updating the allowance of an ERC20 token</p>

**Kind**: instance method of [<code>ClientEstimation</code>](#ClientEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IDepositParams</code> | 

<a name="ClientEstimation+updateAllowance"></a>

### clientEstimation.updateAllowance(_params) ⇒ <code>\*</code>
<p>Estimates the gas fee of updating the allowance of an ERC20 token</p>

**Kind**: instance method of [<code>ClientEstimation</code>](#ClientEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>IDepositParams</code> | 

