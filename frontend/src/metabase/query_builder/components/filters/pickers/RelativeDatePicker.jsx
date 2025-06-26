import React, { Component } from "react";
import cx from "classnames";

import NumericInput from "metabase/components/NumericInput";
import DateUnitSelector from "../DateUnitSelector";

import { assoc } from "icepick";

import type {
  TimeIntervalFilter,
  RelativeDatetimeUnit,
} from "metabase-types/types/Query";

import {
  getMaxRangeDaysFromToken,
  convertToDays,
} from "metabase/query_builder/components/filters/pickers/Utils";

export const DATE_PERIODS: RelativeDatetimeUnit[] = [
  "day",
  "week",
  "month",
  "year",
];

const TIME_PERIODS: RelativeDatetimeUnit[] = ["minute", "hour"];

// define ALL_PERIODS in increasing order of duration
const ALL_PERIODS = TIME_PERIODS.concat(DATE_PERIODS);

type Props = {
  filter: TimeIntervalFilter,
  onFilterChange: (filter: TimeIntervalFilter) => void,
  formatter: (value: any) => any,
  className?: string,
};

type State = {
  showUnits: boolean,
  lastValidIntervals: number,
  lastValidUnit: RelativeDatetimeUnit,
};

export default class RelativeDatePicker extends Component<Props, State> {
  state = {
    showUnits: false,
    lastValidIntervals: this.props.filter[2],
    lastValidUnit: this.props.filter[3],
  };

  static defaultProps = {
    formatter: value => value,
  };

  validateRangeWithinLimit = (intervals, unit) => {
    const maxDays = getMaxRangeDaysFromToken?.();
    const totalDays = convertToDays(intervals, unit);

    if (maxDays && totalDays > maxDays) {
      alert(`You can only select up to ${maxDays} days.`);
      return false;
    }
    return true;
  };

  handleIntervalChange = (value: any) => {
    const { filter, onFilterChange, formatter } = this.props;
    const unit = filter[3];
    const updatedInterval = formatter(value);

    if (this.validateRangeWithinLimit(updatedInterval, unit)) {
      this.setState({ lastValidIntervals: updatedInterval });
      onFilterChange(assoc(filter, 2, updatedInterval));
    } else {
      onFilterChange(assoc(filter, 2, this.state.lastValidIntervals));
    }
  };

  handleUnitChange = (value: RelativeDatetimeUnit) => {
    const { filter, onFilterChange } = this.props;
    const intervals = filter[2];

    if (this.validateRangeWithinLimit(intervals, value)) {
      this.setState({
        showUnits: false,
        lastValidUnit: value,
      });
      onFilterChange(assoc(filter, 3, value));
    } else {
      onFilterChange(assoc(filter, 3, this.state.lastValidUnit));
      this.setState({ showUnits: false });
    }
  };

  render() {
    const { filter, className } = this.props;
    const intervals = filter[2];
    const unit = filter[3];
    return (
      <div className={cx(className, "flex align-center")}>
        <NumericInput
          className="mr2 input border-purple text-right"
          style={{
            width: 65,
            fontSize: 14,
            fontWeight: 700,
            padding: 8,
          }}
          data-ui-tag="relative-date-input"
          value={
            typeof intervals === "number" ? Math.abs(intervals) : intervals
          }
          onChange={this.handleIntervalChange}
          placeholder="30"
        />
        <div className="flex-full">
          <DateUnitSelector
            open={this.state.showUnits}
            value={unit}
            onChange={this.handleUnitChange}
            togglePicker={() =>
              this.setState({ showUnits: !this.state.showUnits })
            }
            intervals={intervals}
            formatter={this.props.formatter}
            periods={ALL_PERIODS}
          />
        </div>
      </div>
    );
  }
}
