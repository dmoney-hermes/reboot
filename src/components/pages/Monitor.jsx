import GarageMonitor from '../GarageMonitor';

// Tailnet-only address, safe to commit.
const HUB_URL = 'https://hermes-box.tail342924.ts.net';

const Monitor = () => (
  <div className='mx-auto max-w-7xl px-4 py-6'>
    <GarageMonitor hubUrl={HUB_URL} />
  </div>
);

export default Monitor;
