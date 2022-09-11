/*
channel frame format:
    frame = channel_id ++ frame_number ++ frame_data_length ++ frame_data ++ is_last

    channel_id        = bytes16
    frame_number      = uint16
    frame_data_length = uint32
    frame_data        = bytes
    is_last           = bool

*/

/*
batch format:

    batch = batch_version ++ content

    batch_version = 0
    content       = rlp_encode([parent_hash, epoch_number, epoch_hash, timestamp, transaction_list])
    parent_hash = block hash of previous L2 block
    epoch_number = number of corresponding L1 block
    epoch_hash = hash of the corresponding L1 block
    timestamp = L2 block timestamp
    transaction_list = RLP-encoded list of EIP-2718 encoded transactions

*/

// example of a raw tx https://etherscan.io/getRawTx?tx=0x4b353f2ac768fb3a4d1be17bf2ced520a60beb3a154ce1b145bcb6391bc84a7b

import * as dotenv from 'dotenv'
dotenv.config()
import { ethers } from 'ethers'
import { deflate, unzip } from 'node:zlib';

const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/" + process.env.ALCHEMY_KEY);

function create_batch(parent_hash, epoch_number, epoch_hash, timestamp, raw_txs) {
    return "0x00" + ethers.utils.RLP.encode([parent_hash, epoch_number, epoch_hash, timestamp, raw_txs]).slice(2)
}

async function get_raw_txs(block_number) {
    var raw_txs = []
    const block = await provider.getBlockWithTransactions(block_number);
    for (const tx of block.transactions) {
        const raw_tx = to_raw(tx)
        raw_txs.push(raw_tx)
    }
    return raw_txs
}

function to_raw(tx) {
    const signature = ethers.utils.joinSignature({
        r: tx.r,
        s: tx.s,
        v: tx.v
    })
    strip(tx)
    const raw_tx = ethers.utils.serializeTransaction(tx, signature)
    return raw_tx
}

function strip(tx) {
    delete tx.gasPrice
    delete tx.hash
    delete tx.accessList
    delete tx.blockHash
    delete tx.blockNumber
    delete tx.transactionIndex
    delete tx.confirmations
    delete tx.from
    delete tx.r
    delete tx.s
    delete tx.v
    delete tx.creates
    delete tx.wait
}

function random_hash() {
    return ethers.utils.hexlify(ethers.utils.randomBytes(32))
}

function calculate_calldata_gas_cost(calldata) {
    const cost_per_zero_byte = 4
    const cost_per_non_zero_byte = 16

    var cost = 0
    for (const byte of calldata) {
        if (byte == 0) {
            cost += cost_per_zero_byte
        } else {
            cost += cost_per_non_zero_byte
        }
    }
    return cost
}

/**
 * 
 * @param {string} hex_str 0x prefixed hex string
 * @returns byte array
 */
function to_byte_array(hex_str) {
  if (!hex_str) {
    return new Uint8Array();
  }
  
  var a = [];
  for (var i = 2, len = hex_str.length; i < len; i+=2) {
    a.push(parseInt(hex_str.substr(i,2),16));
  }
  
  return new Uint8Array(a);
}

const txs = await get_raw_txs(13100000)

const batch = create_batch(random_hash(), "0x"+(13100000).toString(16), random_hash(), "0x"+(1620000000).toString(16), txs)
// compress batch
const compressed_batch = await new Promise((resolve, reject) => {
    deflate(batch, (err, buffer) => {
        if (err) {
            reject(err)
        } else {
            resolve(buffer)
        }
    })
})
const batch_size = (batch.length-2)/2
console.log("batch size: " + batch_size + " bytes")
console.log("compressed batch size: " + compressed_batch.length + " bytes")
console.log("byte compression rate: " + (compressed_batch.length/batch_size*100).toFixed(2) + "%")
const uncompressed_calldata_gas_cost = calculate_calldata_gas_cost(to_byte_array(batch))
console.log("uncompressed calldata gas cost: " + uncompressed_calldata_gas_cost + " gas")
const compressed_calldata_gas_cost = calculate_calldata_gas_cost(compressed_batch)
console.log("compressed calldata gas cost: " + compressed_calldata_gas_cost + " gas")
console.log("calldata gas compression rate: " + (compressed_calldata_gas_cost/uncompressed_calldata_gas_cost*100).toFixed(2) + "%")


const txs_2 = await get_raw_txs(13100001)
const batch_2 = create_batch(random_hash(), "0x"+(13100001).toString(16), random_hash(), "0x"+(1620000000).toString(16), txs_2)
const txs_3 = await get_raw_txs(13100002)
const batch_3 = create_batch(random_hash(), "0x"+(13100002).toString(16), random_hash(), "0x"+(1620000000).toString(16), txs_3)
const txs_4 = await get_raw_txs(13100003)
const batch_4 = create_batch(random_hash(), "0x"+(13100003).toString(16), random_hash(), "0x"+(1620000000).toString(16), txs_4)
const txs_5 = await get_raw_txs(13100004)
const batch_5 = create_batch(random_hash(), "0x"+(13100004).toString(16), random_hash(), "0x"+(1620000000).toString(16), txs_5)
const txs_6 = await get_raw_txs(13100005)
const batch_6 = create_batch(random_hash(), "0x"+(13100005).toString(16), random_hash(), "0x"+(1620000000).toString(16), txs_6)
const txs_7 = await get_raw_txs(13100006)
const batch_7 = create_batch(random_hash(), "0x"+(13100006).toString(16), random_hash(), "0x"+(1620000000).toString(16), txs_7)
const txs_8 = await get_raw_txs(13100007)
const batch_8 = create_batch(random_hash(), "0x"+(13100007).toString(16), random_hash(), "0x"+(1620000000).toString(16), txs_8)
const txs_9 = await get_raw_txs(13100008)
const batch_9 = create_batch(random_hash(), "0x"+(13100008).toString(16), random_hash(), "0x"+(1620000000).toString(16), txs_9)
const txs_10 = await get_raw_txs(13100009)
const batch_10 = create_batch(random_hash(), "0x"+(13100009).toString(16), random_hash(), "0x"+(1620000000).toString(16), txs_10)

const channel = "0x" + batch.slice(2) + batch_2.slice(2) + batch_3.slice(2) + batch_4.slice(2) + batch_5.slice(2) + batch_6.slice(2) + batch_7.slice(2) + batch_8.slice(2) + batch_9.slice(2) + batch_10.slice(2)
const channel_size = (channel.length-2)/2
console.log("channel size: " + channel_size + " bytes")
const compressed_channel = await new Promise((resolve, reject) => {
    deflate(channel, (err, buffer) => {
        if (err) {
            reject(err)
        } else {
            resolve(buffer)
        }
    })
})
console.log("compressed channel size: " + compressed_channel.length + " bytes")
console.log("byte compression rate: " + (compressed_channel.length/channel_size*100).toFixed(2) + "%")
const uncompressed_channel_calldata_gas_cost = calculate_calldata_gas_cost(to_byte_array(channel))
console.log("uncompressed channel calldata gas cost: " + uncompressed_channel_calldata_gas_cost + " gas")
const compressed_channel_calldata_gas_cost = calculate_calldata_gas_cost(compressed_channel)
console.log("compressed channel calldata gas cost: " + compressed_channel_calldata_gas_cost + " gas")
console.log("calldata gas compression rate: " + (compressed_channel_calldata_gas_cost/uncompressed_channel_calldata_gas_cost*100).toFixed(2) + "%")

