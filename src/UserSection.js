import React from 'react';
import { connect } from 'react-redux';
import { Skeleton } from 'antd';
import HeaderApp from 'components/HeaderApp';
import LateralMenu from './LateralMenu';

class UserSection extends React.Component {
  render() {
    return (
      <React.Fragment>
        {/* se renderiza el menu lateral y el header */}
        {this.props.section === 'menu' && (
          <LateralMenu
            userClaims={this.props.userClaims}
            loadingUser={this.props.loadingUser}
            siderCollapsed={this.props.siderCollapsed}
          />
        )}
        {this.props.section === 'header' && (
          <Skeleton
            active={this.props.loadingUser}
            loading={!this.props.userClaims}
            paragraph={{ rows: 2 }}
            title={false}
            className="claims-rrgg-skeleton-header"
          >
            <HeaderApp userClaims={this.props.userClaims} signOut={this.props.signOut} />
          </Skeleton>
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    userClaims: state.services.user.userClaims,
    loadingUser: state.services.user.isLoadingUserClaims
  };
}
// conecta el redux store con el componente
export default connect(mapStateToProps)(UserSection);
