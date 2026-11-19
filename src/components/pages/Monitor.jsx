import GarageMonitor from '../GarageMonitor';

// The hub is only reachable from devices on the Tailscale network, so the
// address is safe to commit. Everyone else just sees the lock screen.
const HUB_URL = 'https://hermes-box.tail342924.ts.net';

const Monitor = () => (
  <div className='mx-auto max-w-7xl px-4 py-6'>
    <GarageMonitor hubUrl={HUB_URL} />
  </div>
);

export default Monitor;
