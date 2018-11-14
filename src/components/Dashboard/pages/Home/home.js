import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import LastSessionCard from "./Cards/lastSessionCard";
import MonthRecapCard from "./Cards/monthRecapCard";
import ProfileCard from "./Cards/profileCard";
import AllTimeStatsCard from "./Cards/allTimeStatsCard";
import VanityCard from "./Cards/vanityStatsCard";

import fire from "../../../../config/fire";

const styles = theme => ({
  root: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing.unit * 2
  },
  paper: {
    height: 140,
    width: 100
  },
  control: {
    padding: theme.spacing.unit * 2
  }
});

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userid: fire.auth().currentUser.uid,
      loading: true,
      tabsValue: 0
    };
  }

  componentDidMount() {
    const _this = this;
    const userid = this.state.userid;

    fire
      .database()
      .ref("users/" + userid)
      .once("value")
      .then(function(snapshot) {
        const trainingSessions = snapshot.val().trainingSessions;
        const trainingKeys = Object.keys(trainingSessions);
        let classCount = 0;
        let giCount = 0;
        let noGiCount = 0;
        let openMatCount = 0;
        const latest = trainingKeys.reduce((acc, loc) =>
          trainingSessions[acc].date < trainingSessions[loc].date ? acc : loc
        );

        trainingKeys.map(key => {
          trainingSessions[key].style === "gi"
            ? (giCount += 1)
            : (noGiCount += 1);
          trainingSessions[key].type === "class"
            ? (classCount += 1)
            : (openMatCount += 1);
        });

        _this.setState({
          trainingSessions: snapshot.val().trainingSessions,
          latestPost: trainingSessions[latest],
          goal: snapshot.val().profile.currentgoal,
          name: snapshot.val().profile.name,
          gym: snapshot.val().profile.gym,
          rank: snapshot.val().profile.rank,
          giCount: giCount,
          noGiCount: noGiCount,
          classCount: classCount,
          openMatCount: openMatCount,
          loading: false
        });
      });
  }

  handleTabChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { tabsValue } = this.state;

    return (
      <Grid container className={classes.root}>
        {this.state.loading && <p>Im loading bitch</p>}
        {!this.state.loading && (
          <Grid container spacing={16}>
            <Grid item xs={12} sm={12} md={12} lg={9}>
              <MonthRecapCard
                classCount={this.state.classCount}
                openMatCount={this.state.openMatCount}
                giCount={this.state.giCount}
                noGiCount={this.state.noGiCount}
              />
              <Grid container spacing={16}>
                <Grid item xs={12}>
                  <AppBar position="static" color="default">
                    <Tabs value={tabsValue} onChange={this.handleTabChange}>
                      <Tab value={0} label="Table" />
                      <Tab value={1} label="Graphs" />
                    </Tabs>
                  </AppBar>
                  {tabsValue === 0 && <AllTimeStatsCard />}
                  {tabsValue === 1 && <VanityCard />}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={3}>
              <ProfileCard
                goal={this.state.goal}
                rank={this.state.rank}
                gym={this.state.gym}
                name={this.state.name}
              />

              <LastSessionCard
                latestPost={this.state.latestPost}
                loading={this.state.loading}
              />
            </Grid>
            <Grid item xs={12}>
              <VanityCard />
            </Grid>
          </Grid>
        )}
      </Grid>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  loading: PropTypes.bool
};

export default withStyles(styles)(Dashboard);
