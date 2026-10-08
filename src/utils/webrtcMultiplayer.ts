// Zero-Server WebRTC DataChannel Peer-to-Peer Networking Engine
// Allows instant 2-player multiplayer with 0% server compute cost

export type PeerRole = 'host' | 'guest';

export interface MultiplayerMessage {
  type: 'handshake' | 'input' | 'move' | 'state' | 'chat' | 'ping' | 'pong';
  sender: string;
  payload: any;
  timestamp: number;
}

export class WebRTCPeerEngine {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private role: PeerRole = 'host';
  private onMessageCallback: ((msg: MultiplayerMessage) => void) | null = null;
  private onStatusCallback: ((status: 'disconnected' | 'connecting' | 'connected') => void) | null = null;
  private pingInterval: any = null;

  constructor() {
    this.initPeerConnection();
  }

  private initPeerConnection() {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' }
      ]
    };

    this.peerConnection = new RTCPeerConnection(config);

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'connected') {
        this.onStatusCallback?.('connected');
        this.startPing();
      } else if (state === 'connecting') {
        this.onStatusCallback?.('connecting');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.onStatusCallback?.('disconnected');
        this.stopPing();
      }
    };
  }

  // Host creates room and returns compact Offer SDP
  public async createRoomOffer(): Promise<string> {
    if (!this.peerConnection) this.initPeerConnection();
    this.role = 'host';

    this.dataChannel = this.peerConnection!.createDataChannel('arcadex_p2p_channel', {
      ordered: true
    });
    this.setupDataChannel(this.dataChannel);

    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);

    // Wait for ICE gathering to complete so SDP is fully self-contained
    await new Promise<void>((resolve) => {
      if (this.peerConnection!.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkState = () => {
          if (this.peerConnection!.iceGatheringState === 'complete') {
            this.peerConnection!.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        this.peerConnection!.addEventListener('icegatheringstatechange', checkState);
        setTimeout(resolve, 1500); // 1.5s bounded timeout
      }
    });

    const sdpData = JSON.stringify(this.peerConnection!.localDescription);
    return btoa(encodeURIComponent(sdpData));
  }

  // Guest joins using Host Offer and creates Answer SDP
  public async joinRoomWithOffer(hostOfferB64: string): Promise<string> {
    if (!this.peerConnection) this.initPeerConnection();
    this.role = 'guest';

    this.peerConnection!.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(this.dataChannel);
    };

    const sdpJson = decodeURIComponent(atob(hostOfferB64));
    const offerDesc = new RTCSessionDescription(JSON.parse(sdpJson));
    await this.peerConnection!.setRemoteDescription(offerDesc);

    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);

    await new Promise<void>((resolve) => {
      if (this.peerConnection!.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkState = () => {
          if (this.peerConnection!.iceGatheringState === 'complete') {
            this.peerConnection!.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        this.peerConnection!.addEventListener('icegatheringstatechange', checkState);
        setTimeout(resolve, 1500);
      }
    });

    const answerData = JSON.stringify(this.peerConnection!.localDescription);
    return btoa(encodeURIComponent(answerData));
  }

  // Host confirms Answer from Guest
  public async confirmGuestAnswer(guestAnswerB64: string): Promise<void> {
    if (!this.peerConnection) return;
    const sdpJson = decodeURIComponent(atob(guestAnswerB64));
    const answerDesc = new RTCSessionDescription(JSON.parse(sdpJson));
    await this.peerConnection.setRemoteDescription(answerDesc);
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      this.onStatusCallback?.('connected');
      this.send({
        type: 'handshake',
        sender: this.role,
        payload: { ready: true },
        timestamp: Date.now()
      });
    };

    channel.onclose = () => {
      this.onStatusCallback?.('disconnected');
    };

    channel.onmessage = (event) => {
      try {
        const msg: MultiplayerMessage = JSON.parse(event.data);
        this.onMessageCallback?.(msg);
      } catch (err) {
        console.error('Failed to parse P2P message', err);
      }
    };
  }

  public send(msg: MultiplayerMessage): boolean {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }

  public onMessage(callback: (msg: MultiplayerMessage) => void) {
    this.onMessageCallback = callback;
  }

  public onStatus(callback: (status: 'disconnected' | 'connecting' | 'connected') => void) {
    this.onStatusCallback = callback;
  }

  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({
        type: 'ping',
        sender: this.role,
        payload: null,
        timestamp: Date.now()
      });
    }, 5000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public disconnect() {
    this.stopPing();
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
