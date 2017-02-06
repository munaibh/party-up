<?php

class Message_model extends CI_Model {

	function __construct() {
		parent::__construct();
	}

	public function getGroups($userid) {

		// Get All Accepted Invites.
		$stmnt = "
			SELECT DISTINCT post.postid, post.game, post.userid, user.username FROM invite
			INNER JOIN post ON invite.postid = post.postid
			INNER JOIN user ON post.userid = user.userid
			WHERE post.userid = {$userid} OR invite.userid = {$userid}
			AND invite.status = 1";

		// Store Results.
		$output = array();
		$dbres = $this->db->query($stmnt);

		// If groups exists
		if($dbres->num_rows() > 0) {

			// Retrieve All Groups.
			foreach($dbres->result_array() as $group) {
				$output[] = [
					"id" => $group['postid'],
					'game' => $group['game'],
					'hostname' => $group['username'],
					'platform' => 'Xbox',
					'host' => ($userid == $group['userid']) ? true : false,
				];
			}
		}

		// Return output else return false.
		return (!empty($output)) ? $output : false;
	}

	public function getMessages ($userid, $postid, $sort, $datetime) {

		// Grant Access to Messages.
		$stmnt = "
			SELECT DISTINCT post.* FROM invite
			INNER JOIN post ON invite.postid = post.postid
			WHERE post.userid = {$userid} AND post.postid = {$postid} AND invite.status = 1
			OR invite.userid = {$userid}  AND post.postid = {$postid} AND invite.status = 1";

		// Store Number of Results.
		$numrows = $this->db->query($stmnt)->num_rows();

		if($numrows == 1) {

			$stmnt = "
				SELECT DISTINCT message.*, user.*, message.datetime AS time FROM message
	      INNER JOIN USER ON message.userid = user.userid
				INNER JOIN messageread ON messageread.postid = message.postid";

			if($sort == "latest") {
				// Query after last read message.
				$substmnt = "SELECT datetime FROM messageread WHERE userid = {$userid} AND postid = {$postid}";
				$storedtime = $this->db->query($substmnt)->result_array()[0]['datetime'];
				$stmnt .= " where message.postid = '{$postid}' AND message.datetime > '{$storedtime}'";
			}
			else {
				$stmnt.= "
					WHERE MESSAGE.POSTID = {$postid}
					ORDER BY MESSAGE.DATETIME ASC";
			}

			// Retrieve Message and Return.
			$dbres = $this->db->query($stmnt)->result_array();

			// Update Last Read Datetime.
			$updateWhere = ['userid' => $userid, 'postid' => $postid];
			$updateData  = ['userid' => $userid, 'postid' => $postid, 'datetime' => $datetime];
			$this->db->where($updateWhere);
			$res = $this->db->get('messageread')->num_rows();
			$this->db->where($updateWhere);

			// If message date exists update, else insert.
			if($res != 1) { $this->db->insert('messageread', $updateData); }
			else if(count($dbres) > 0){ $this->db->update('messageread', ['datetime' => end($dbres)['time']]); }
			return $this->buildOutput($dbres, $userid);

		}

		// Return False upon Error.
		return false;

	}


	public function buildOutput($messages,$userid) {

		// Create $ouput array
		$output = array();

		// Build Output JSON.
		foreach($messages as $msg) {
			$output[] = [
				"id" => (int) $msg['msgid'],
				'message' => $msg['message'],
				'sender' => ($userid == $msg['userid']) ? true : false,
				'user' => [ 'username' => $msg['username'], 'avatar' => $msg['avatarurl'] ],
				'datetime' => $msg['time']
			];
		}

		// Return Output else return false.
		return (!empty($output)) ? $output : false;

	}


	public function addMessage($userid, $postid, $message, $datetime) {

		// Verify user is part of group.
		$stmnt = "
			SELECT DISTINCT post.* FROM invite
			INNER JOIN post ON invite.postid = post.postid
			WHERE post.userid = {$userid} AND post.postid = {$postid} AND invite.status = 1
			OR invite.userid = {$userid}  AND post.postid = {$postid} AND invite.status = 1";

		$numrows = $this->db->query($stmnt)->num_rows();

		// Build insert aray.
		if($numrows == 1) {
			$insert = [
				'userid' => $userid,
				'postid' => $postid,
				'message' => $message,
				'datetime' => date('Y-m-d H:i:s')
			];
			// Insert message to db and return true.
			$this->db->insert('message', $insert);
			return true;
		}

		// On error return false;
		return false;

	}

}
