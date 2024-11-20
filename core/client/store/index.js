//export all actions, states, and pinia stores
import { useSTAcStore } from './stac';
import * as actions from './actions';
import * as states from './states';

export default { stac: { useSTAcStore }, actions, states };
