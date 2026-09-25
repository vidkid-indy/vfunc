// SPDX-License-Identifier: Apache-2.0
//
// vfunc-ui — layer 2 of vfunc.js: vs* functions return markup (SafeHtml), vf* functions return
// instances (rule 17). Importing this module adds every member to the engine's `vf` object,
// read-only and without replacing existing members, so `vf.vsButton` works in <script> pages and
// in ES modules alike (D-002, D-029). The list follows layer2/catalog.json.

import vf from './_internal/vf.js';
import { DEV, warn } from './_internal/dev.js';
import { vsButton } from './components/button.js';
import { vsField } from './components/field.js';
import { vsInput } from './components/input.js';
import { vsTextarea } from './components/textarea.js';
import { vsSelect } from './components/select.js';
import { vsCheckbox } from './components/checkbox.js';
import { vsRadioGroup } from './components/radio-group.js';
import { vsSwitch } from './components/switch.js';
import { vsSlider } from './components/slider.js';
import { vsProgress } from './components/progress.js';
import { vsButtonGroup } from './components/button-group.js';
import { vsBadge } from './components/badge.js';
import { vsTag } from './components/tag.js';
import { vsAvatar } from './components/avatar.js';
import { vsAlert } from './components/alert.js';
import { vsCard } from './components/card.js';
import { vsDescriptions } from './components/descriptions.js';
import { vsStatCard } from './components/stat-card.js';
import { vsTimeline } from './components/timeline.js';
import { vsEmptyState } from './components/empty-state.js';
import { vsSkeleton } from './components/skeleton.js';
import { vsSpinner } from './components/spinner.js';
import { vsTooltip } from './components/tooltip.js';
import { vsNumberInput, vfNumberInput } from './components/number-input.js';
import { vsSearchInput, vfSearchInput } from './components/search-input.js';
import { vsPasswordInput, vfPasswordInput } from './components/password-input.js';
import { vsChipsInput, vfChipsInput } from './components/chips-input.js';
import { vsRating, vfRating } from './components/rating.js';
import { vsSelectButton, vfSelectButton } from './components/select-button.js';
import { vsMaskedInput, vfMaskedInput } from './components/masked-input.js';
import { vsDatePicker, vfDatePicker } from './components/date-picker.js';
import { vsTimePicker, vfTimePicker } from './components/time-picker.js';
import { vfDateRangePicker } from './components/date-range-picker.js';
import { vsListView, vfListView } from './components/list-view.js';
import { vfCarousel } from './components/carousel.js';
import { vsBreadcrumb } from './components/breadcrumb.js';
import { vsPagination, vfPagination } from './components/pagination.js';
import { vsTabs, vfTabs } from './components/tabs.js';
import { vsAccordion, vfAccordion } from './components/accordion.js';
import { vsStepper, vfStepper } from './components/stepper.js';

const members = {
  vsButton: vsButton,
  vsField: vsField,
  vsInput: vsInput,
  vsTextarea: vsTextarea,
  vsSelect: vsSelect,
  vsCheckbox: vsCheckbox,
  vsRadioGroup: vsRadioGroup,
  vsSwitch: vsSwitch,
  vsSlider: vsSlider,
  vsProgress: vsProgress,
  vsButtonGroup: vsButtonGroup,
  vsBadge: vsBadge,
  vsTag: vsTag,
  vsAvatar: vsAvatar,
  vsAlert: vsAlert,
  vsCard: vsCard,
  vsDescriptions: vsDescriptions,
  vsStatCard: vsStatCard,
  vsTimeline: vsTimeline,
  vsEmptyState: vsEmptyState,
  vsSkeleton: vsSkeleton,
  vsSpinner: vsSpinner,
  vsTooltip: vsTooltip,
  vsNumberInput: vsNumberInput,
  vfNumberInput: vfNumberInput,
  vsSearchInput: vsSearchInput,
  vfSearchInput: vfSearchInput,
  vsPasswordInput: vsPasswordInput,
  vfPasswordInput: vfPasswordInput,
  vsChipsInput: vsChipsInput,
  vfChipsInput: vfChipsInput,
  vsRating: vsRating,
  vfRating: vfRating,
  vsSelectButton: vsSelectButton,
  vfSelectButton: vfSelectButton,
  vsMaskedInput: vsMaskedInput,
  vfMaskedInput: vfMaskedInput,
  vsDatePicker: vsDatePicker,
  vfDatePicker: vfDatePicker,
  vsTimePicker: vsTimePicker,
  vfTimePicker: vfTimePicker,
  vfDateRangePicker: vfDateRangePicker,
  vsListView: vsListView,
  vfListView: vfListView,
  vfCarousel: vfCarousel,
  vsBreadcrumb: vsBreadcrumb,
  vsPagination: vsPagination,
  vfPagination: vfPagination,
  vsTabs: vsTabs,
  vfTabs: vfTabs,
  vsAccordion: vsAccordion,
  vfAccordion: vfAccordion,
  vsStepper: vsStepper,
  vfStepper: vfStepper
};

const hasOwn = Object.prototype.hasOwnProperty;
const conflicts = [];
for (const key in members) {
  if (!hasOwn.call(members, key)) continue;
  if (hasOwn.call(vf, key)) {
    if (vf[key] !== members[key]) conflicts.push(key);
    continue;
  }
  Object.defineProperty(vf, key, { value: members[key], enumerable: true, writable: false, configurable: false });
}
if (DEV && conflicts.length) warn('vf already has ' + conflicts.join(', ') + '; the existing members were kept.');

export {
  vsButton,
  vsField,
  vsInput,
  vsTextarea,
  vsSelect,
  vsCheckbox,
  vsRadioGroup,
  vsSwitch,
  vsSlider,
  vsProgress,
  vsButtonGroup,
  vsBadge,
  vsTag,
  vsAvatar,
  vsAlert,
  vsCard,
  vsDescriptions,
  vsStatCard,
  vsTimeline,
  vsEmptyState,
  vsSkeleton,
  vsSpinner,
  vsTooltip,
  vsNumberInput,
  vfNumberInput,
  vsSearchInput,
  vfSearchInput,
  vsPasswordInput,
  vfPasswordInput,
  vsChipsInput,
  vfChipsInput,
  vsRating,
  vfRating,
  vsSelectButton,
  vfSelectButton,
  vsMaskedInput,
  vfMaskedInput,
  vsDatePicker,
  vfDatePicker,
  vsTimePicker,
  vfTimePicker,
  vfDateRangePicker,
  vsListView,
  vfListView,
  vfCarousel,
  vsBreadcrumb,
  vsPagination,
  vfPagination,
  vsTabs,
  vfTabs,
  vsAccordion,
  vfAccordion,
  vsStepper,
  vfStepper
};
export default members;
