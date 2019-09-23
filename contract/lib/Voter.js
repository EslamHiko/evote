'use strict';

class Voter {

  constructor(id, name, email, password, date) {

      this.id = id;
      this.name = name;
      this.email = email;
      this.password = password;
      this.date = date;
      this.type = 'user';
      if (this.__isContract) {
        delete this.__isContract;
      }
      return this;


  }

  /**
   *
   * validateVoter
   *
   * check for valid ID card - stateID or drivers License.
   *
   * @param voterId - an array of choices
   * @returns - yes if valid Voter, no if invalid
   */
  async validateVoter(voterId) {
    //VoterId error checking here, i.e. check if valid drivers License, or state ID

    return true;

  }

  /**
   *
   * validateRegistrar
   *
   * check for valid registrarId, should be cross checked with government
   *
   * @param voterId - an array of choices
   * @returns - yes if valid Voter, no if invalid
   */
  async validateRegistrar(registrarId) {

    //registrarId error checking here, i.e. check if valid drivers License, or state ID

    return true;

  }

}
module.exports = Voter;
