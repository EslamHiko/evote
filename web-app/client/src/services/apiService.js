import Api from '@/services/api'

export default {
  castBallot(electionId, voterId, picked) {
    return Api().post('castBallot', {
      electionId: electionId,
      voterId: voterId,
      picked: picked
    })
  },
  queryAll() {
    return Api().get('queryAll')
  },
  queryByObjectType() {
    return Api().get('queryByObjectType')
  },
  queryWithQueryString(selected) {
    return Api().post('queryWithQueryString', {
      selected: selected
    })
  },
  registerVoter(name, email, password) {
    return Api().post('register', {
      name: name,
      email: email,
      password: password,
    })
  },
  validateVoter(email,password) {
    return Api().post('login', {
      email: email,
      password:password
    })
  },
  queryByKey(key) {
    return Api().post('queryByKey', {
      key: key
    })
  },
  getCurrentStanding() {
    return Api().get('getCurrentStanding')
  }
}
