const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

export const fetchIPFSContent = async (uri: string) => {
  try {
    if (!uri.startsWith('ipfs://')) {
      throw new Error('Not an IPFS URI');
    }
    const hash = uri.replace('ipfs://', '');
    const response = await fetch(`${IPFS_GATEWAY}${hash}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching IPFS content:', error);
    return null;
  }
};