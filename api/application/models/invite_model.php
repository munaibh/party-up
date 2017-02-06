<?php

class Invite_model extends CI_Model {

	function __construct() {
		parent::__construct();
	}

  public function pendingInvites($userid) {

    // Retrieve invites and user details.
    $stmnt = "
      SELECT invite.inviteid, invite.userid as friendid, post.*, user.*
      FROM invite INNER JOIN post ON invite.postid = post.postid
			INNER JOIN user ON user.userid = invite.userid
      WHERE invite.userid = {$userid} AND invite.status = 0
      OR post.userid = {$userid} AND invite.status = 0
    ";

		// Execute quey and initilize output array.
    $output = array();
    $dbres  = $this->db->query($stmnt);

		// Convert returned array to JSON.
    foreach($dbres->result_array() as $invite) {
      $output[] = [
        'id' => $invite['inviteid'],
        'title' => $invite['message'],
				'game' => $invite['game'],
				'user' => [
					'username' => $invite['username'],
					'avatar' => $invite['avatarurl'],
				],
        'host' => ($invite['friendid'] != $userid) ? true : false,
      ];
    }
    // If no invites return false, else, invite details.
    return (!empty($output) ? $output : ['status' => false]);

  }

	public function manageInvite($userid, $inviteid, $status) {

		// Check if invite exists.
    $stmnt = "
      SELECT invite.*, post.userid
      FROM invite INNER JOIN post ON invite.postid = post.postid
      WHERE post.userid = {$userid} AND invite.status = 0 AND invite.inviteid = {$inviteid}
    ";

    if($this->db->query($stmnt)->num_rows() == 1) {
			// If invite exists update with passed decision.
      $this->db->where('inviteid', $inviteid);
      $this->db->update('invite', ['status' => $status]);
			// If request complete reject remaining invites.
      $this->db->where('inviteid', $inviteid);
      $this->sanatizeInvite($userid, $this->db->get('invite')->result_array()[0]['postid'] );
      return true;
    }

		// On error return false.
    return false;

  }

	public function cancelInvite($inviteid, $userid) {

		$stmnt = "SELECT * FROM invite WHERE inviteid = ? AND userid = ? AND status = 0";
		$dbres = $this->db->query($stmnt, [$inviteid, $userid])->num_rows();
		if($dbres == 1) {
			$this->db->where('inviteid', $inviteid);
			$this->db->delete('invite');
			return true;
		}
		return false;

	}

  public function sanatizeInvite($userid, $postid) {

    // Decline remaining invite and set status to complete.
    $stmnt = "SELECT post.players FROM post WHERE postid = {$postid} AND post.userid = {$userid}";
    $dbres = $this->db->query($stmnt);
    if($dbres->num_rows() == 1) {

      $players = $dbres->result_array()[0]['players'];
      $stmnt = "SELECT * FROM invite WHERE postid = {$postid} AND status = 1";
      $dbres = $this->db->query($stmnt);

      if($players == $dbres->num_rows()) {
        // Set remaining Invites to Rejected
        $this->db->where('postid', $postid);
        $this->db->where('status', 0);
        $this->db->update('invite', ['status' => 2]);

        // Set Post to Complete.
        $this->db->where('postid', $postid);
        $this->db->update('post', ['status' => 1]);
      }
    }
  }

}
