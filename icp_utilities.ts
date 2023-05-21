import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { Actor, HttpAgent } from "@dfinity/agent";
export { Actor, HttpAgent } from "@dfinity/agent";

export const sampleLocalHost = "http://127.0.0.1:4943";

// If a function is not query, you to still provide the last bracket but empty
// meaning the same function signature would be ([IDL.Text], [IDL.Text], [])
export const sampleIdlFactory = ({ IDL }) => {
  return IDL.Service({ greet: IDL.Func([IDL.Text], [IDL.Text], ["query"]) });
};

export const sampleCanisterId = "rrkah-fqaaa-aaaaa-aaaaq-cai";

export const sampleJsonedKey = `[
"04c91f584587b4173af42b21f94ed52b07299e8679f22367da5d03f5b86df17713cc1473a93c2a5b6878a4e8afe07f3de891950e4dc130d14be7790cbd96100c81",
"2a1923194758ee1987a8066db533f9313caee48f9ffae974feb1529fee206d36"
]`;

export const createIdentityFromJsonedKey = async (jsonedKey) => {
  // const seed = "test test test test test test test test test test test test";
  // const identity = await Secp256k1KeyIdentity.fromSeedPhrase(seed);
  const identity = await Secp256k1KeyIdentity.fromJSON(jsonedKey);
  return identity;
};

// When we find a libary that can do calculation properly, we would use the
// seed to create identity, for now we're using a hardcoded one
export const createIdentityFromSeed = async (seed) => {
  const identity = await Secp256k1KeyIdentity.fromSeedPhrase(seed);
  return identity;
};

// Note that host should be https if it is remote, http only works if it is on
// localhost
export const createAgent = async (host, identity, customFetch) => {
  let agent = new HttpAgent({
    host: host,
    identity: identity,
    fetch: customFetch,
  });
  // IMPORTANT: Do not call this when network is ic
  try {
    let rootKey = await agent.fetchRootKey();
  } catch (e) {
    console.error(e);
  }

  return agent;
};

export const createActor = (idlFactory, canisterId, agent) => {
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
